import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { ModerateChatMessageDto } from "./dto/moderate-chat-message.dto";
import type { SendChatMessageDto } from "./dto/send-chat-message.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async getCourseRoom(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.chatRoom.upsert({
      where: {
        courseId_type: {
          courseId,
          type: "COURSE"
        }
      },
      update: {},
      create: {
        courseId,
        type: "COURSE",
        title: "Course discussion"
      },
      include: this.roomInclude()
    });
  }

  async listMessages(user: CurrentUser, roomId: string) {
    await this.assertCanReadRoom(user, roomId);
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        deletedAt: null
      },
      take: 100,
      orderBy: { createdAt: "desc" },
      include: this.messageInclude()
    });

    return messages.reverse();
  }

  async sendMessage(user: CurrentUser, roomId: string, dto: SendChatMessageDto) {
    await this.assertCanReadRoom(user, roomId);

    return this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        body: dto.body.trim()
      },
      include: this.messageInclude()
    });
  }

  async moderateMessage(user: CurrentUser, messageId: string, dto: ModerateChatMessageDto) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { room: true }
    });

    if (!message) {
      throw new NotFoundException("Chat message not found.");
    }

    if (!message.room.courseId && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      throw new ForbiddenException("Only admins can moderate this chat room.");
    }

    if (message.room.courseId) {
      await this.access.assertCanManageCourse(user, message.room.courseId);
    }

    const moderated = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        deletedAt: message.deletedAt ?? new Date(),
        deletedById: user.id,
        moderationReason: dto.reason
      },
      include: this.messageInclude()
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CHAT_MESSAGE_MODERATED",
        entity: "ChatMessage",
        entityId: messageId,
        metadata: {
          roomId: message.roomId,
          reason: dto.reason
        }
      }
    });

    return moderated;
  }

  private async assertCanReadRoom(user: CurrentUser, roomId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true, courseId: true }
    });

    if (!room) {
      throw new NotFoundException("Chat room not found.");
    }

    if (!room.courseId) {
      if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
        throw new ForbiddenException("Only admins can read this chat room.");
      }

      return room;
    }

    await this.access.assertCanReadCourse(user, room.courseId);
    return room;
  }

  private roomInclude() {
    return {
      course: { select: { id: true, title: true, slug: true } }
    } as const;
  }

  private messageInclude() {
    return {
      sender: { select: { id: true, name: true, role: true } },
      deletedBy: { select: { id: true, name: true, role: true } }
    } as const;
  }
}
