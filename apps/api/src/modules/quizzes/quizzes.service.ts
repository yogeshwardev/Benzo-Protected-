import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateQuizDto } from "./dto/create-quiz.dto";
import type { SubmitQuizDto } from "./dto/submit-quiz.dto";

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async listCourseQuizzes(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: {
        questions:
          user.role === "STUDENT"
            ? {
                select: {
                  id: true,
                  prompt: true,
                  options: true,
                  points: true
                }
              }
            : true,
        attempts:
          user.role === "STUDENT"
            ? {
                where: { enrollment: { student: { userId: user.id } } },
                orderBy: { submittedAt: "desc" }
              }
            : false
      }
    });
  }

  async createQuiz(user: CurrentUser, dto: CreateQuizDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);

    for (const question of dto.questions) {
      if (question.correctOption >= question.options.length) {
        throw new BadRequestException("Correct option index is outside the options array.");
      }
    }

    return this.prisma.quiz.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        questions: {
          create: dto.questions.map((question) => ({
            prompt: question.prompt,
            options: question.options as Prisma.InputJsonValue,
            correctOption: question.correctOption,
            explanation: question.explanation,
            points: question.points ?? 1
          }))
        }
      },
      include: { questions: true }
    });
  }

  async submitQuiz(user: CurrentUser, quizId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found.");
    }

    const enrollment = await this.access.getActiveStudentEnrollment(user.id, quiz.courseId);
    let score = 0;
    let maxScore = 0;

    for (const question of quiz.questions) {
      maxScore += question.points;
      if (dto.answers[question.id] === question.correctOption) {
        score += question.points;
      }
    }

    return this.prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId: enrollment.id,
        answers: {
          answers: dto.answers,
          durationSeconds: dto.durationSeconds,
          maxScore
        },
        score
      }
    });
  }

  async listAttempts(user: CurrentUser, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { courseId: true }
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found.");
    }

    await this.access.assertCanManageCourse(user, quiz.courseId);

    return this.prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: { submittedAt: "desc" },
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });
  }
}

