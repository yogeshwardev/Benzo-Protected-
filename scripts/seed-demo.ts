import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();
const demoPassword = "Benzo@123";

async function upsertStudent(input: {
  email: string;
  name: string;
  studentCode: string;
  referralCode: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      passwordHash: await argon2.hash(demoPassword),
      status: "ACTIVE",
      emailVerifiedAt: new Date()
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: await argon2.hash(demoPassword),
      role: "STUDENT",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      studentProfile: {
        create: {
          studentCode: input.studentCode,
          referralCode: input.referralCode
        }
      }
    },
    include: { studentProfile: true }
  });
}

async function main() {
  const [student, referrer] = await Promise.all([
    upsertStudent({
      email: "student@benzo.test",
      name: "BENZO Test Student",
      studentCode: "BZ-STU-DEMO",
      referralCode: "BENZO-STUDENT"
    }),
    upsertStudent({
      email: "referrer@benzo.test",
      name: "BENZO Demo Referrer",
      studentCode: "BZ-STU-REFERRER",
      referralCode: "BENZO-DEMO"
    })
  ]);

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@benzo.test" },
    update: {
      name: "Arun Demo Instructor",
      passwordHash: await argon2.hash(demoPassword),
      status: "ACTIVE",
      emailVerifiedAt: new Date()
    },
    create: {
      email: "instructor@benzo.test",
      name: "Arun Demo Instructor",
      passwordHash: await argon2.hash(demoPassword),
      role: "INSTRUCTOR",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      instructorProfile: {
        create: {
          instructorCode: "BZ-INS-DEMO",
          qualification: "Senior Software Engineer",
          perClassSalary: 50_000,
          joiningDate: new Date("2025-01-01"),
          bankMasked: "XXXX4321"
        }
      }
    },
    include: { instructorProfile: true }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@benzo.test" },
    update: {
      name: "BENZO Test Admin",
      passwordHash: await argon2.hash(demoPassword),
      status: "ACTIVE",
      emailVerifiedAt: new Date()
    },
    create: {
      email: "admin@benzo.test",
      name: "BENZO Test Admin",
      passwordHash: await argon2.hash(demoPassword),
      role: "ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      adminProfile: { create: {} }
    }
  });

  await prisma.user.upsert({
    where: { email: "superadmin@benzo.test" },
    update: {
      name: "BENZO Test Super Admin",
      passwordHash: await argon2.hash(demoPassword),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date()
    },
    create: {
      email: "superadmin@benzo.test",
      name: "BENZO Test Super Admin",
      passwordHash: await argon2.hash(demoPassword),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date()
    }
  });

  const course = await prisma.course.findUnique({ where: { slug: "c-programming" } });
  const python = await prisma.course.findUnique({ where: { slug: "python" } });

  if (!course || !python || !student.studentProfile || !referrer.studentProfile || !instructor.instructorProfile) {
    throw new Error("Run the course seed before the demo seed.");
  }

  await prisma.course.update({
    where: { id: course.id },
    data: {
      shortDesc: "Learn C through live coding, practical exercises, quizzes, and instructor feedback.",
      fullDesc: "A hands-on C programming course covering syntax, functions, arrays, pointers, files, and a final project.",
      thumbnail: "/images/benzo-learning-dashboard.png"
    }
  });

  await prisma.course.update({
    where: { id: python.id },
    data: {
      shortDesc: "Build practical Python skills through live classes and guided projects.",
      fullDesc: "Start with Python fundamentals and progress through automation, APIs, data handling, and a portfolio project.",
      thumbnail: "/images/benzo-learning-dashboard.png"
    }
  });

  const assignment = await prisma.courseInstructorAssignment.findFirst({
    where: { courseId: course.id, active: true }
  });

  if (!assignment) {
    await prisma.courseInstructorAssignment.create({
      data: {
        courseId: course.id,
        instructorId: instructor.instructorProfile.id,
        active: true
      }
    });
  }

  const schedule = await prisma.courseSchedule.findFirst({
    where: { courseId: course.id, active: true }
  });
  const activeSchedule =
    schedule ??
    (await prisma.courseSchedule.create({
      data: {
        courseId: course.id,
        dayOfWeek: 1,
        startMinute: 19 * 60,
        endMinute: 20 * 60,
        timezone: "Asia/Kolkata"
      }
    }));

  const moduleRecord = await prisma.courseModule.upsert({
    where: { courseId_position: { courseId: course.id, position: 1 } },
    update: { title: "C foundations" },
    create: {
      courseId: course.id,
      title: "C foundations",
      description: "Core syntax, functions, and problem solving.",
      position: 1
    }
  });

  await prisma.lesson.upsert({
    where: { courseId_position: { courseId: course.id, position: 1 } },
    update: { title: "Variables, types, and your first program" },
    create: {
      courseId: course.id,
      moduleId: moduleRecord.id,
      title: "Variables, types, and your first program",
      description: "Write and run a small C program.",
      content: "Set up a compiler, understand primitive types, and build a command-line program.",
      position: 1,
      durationSeconds: 1800,
      freePreview: false
    }
  });

  let courseAssignment = await prisma.assignment.findFirst({
    where: { courseId: course.id, title: "Build a command-line calculator" }
  });

  courseAssignment ??= await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: "Build a command-line calculator",
      description: "Submit a repository or shared document link containing your calculator solution.",
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      required: true
    }
  });

  let quiz = await prisma.quiz.findFirst({ where: { courseId: course.id, title: "C foundations check" } });
  quiz ??= await prisma.quiz.create({
    data: {
      courseId: course.id,
      title: "C foundations check",
      required: true,
      passingPercent: 60,
      questions: {
        create: [
          {
            prompt: "Which function is the usual entry point of a C program?",
            options: ["start", "main", "run", "init"],
            correctOption: 1,
            explanation: "Execution normally begins in main().",
            points: 1
          },
          {
            prompt: "Which format specifier prints an integer?",
            options: ["%s", "%f", "%d", "%c"],
            correctOption: 2,
            explanation: "%d formats a signed decimal integer.",
            points: 1
          }
        ]
      }
    }
  });

  const demoOrder = await prisma.order.findFirst({
    where: { studentId: student.studentProfile.id, courseId: course.id, status: "PAID" }
  });
  const paidOrder =
    demoOrder ??
    (await prisma.order.create({
      data: {
        studentId: student.studentProfile.id,
        courseId: course.id,
        status: "PAID",
        baseAmountInPaise: course.priceInPaise,
        finalAmountInPaise: course.priceInPaise
      }
    }));

  await prisma.payment.upsert({
    where: { providerPaymentId: "pay_benzo_demo_seed" },
    update: { status: "CAPTURED", capturedAt: new Date() },
    create: {
      orderId: paidOrder.id,
      provider: "INTERNAL",
      providerPaymentId: "pay_benzo_demo_seed",
      status: "CAPTURED",
      amountInPaise: paidOrder.finalAmountInPaise,
      method: "DEMO",
      capturedAt: new Date()
    }
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { orderId: paidOrder.id },
    update: { active: true },
    create: {
      studentId: student.studentProfile.id,
      courseId: course.id,
      orderId: paidOrder.id,
      active: true
    }
  });

  await prisma.invoice.upsert({
    where: { orderId: paidOrder.id },
    update: {},
    create: { orderId: paidOrder.id, invoiceNo: "BZ-INV-DEMO-001" }
  });

  await prisma.walletTransaction.upsert({
    where: {
      type_referenceType_referenceId: {
        type: "ADMIN_ADJUSTMENT",
        referenceType: "DEMO_SEED",
        referenceId: student.id
      }
    },
    update: { amountInPaise: 80_000, status: "SETTLED" },
    create: {
      userId: student.id,
      amountInPaise: 80_000,
      type: "ADMIN_ADJUSTMENT",
      status: "SETTLED",
      referenceType: "DEMO_SEED",
      referenceId: student.id
    }
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME100" },
    update: { active: true, discountInPaise: 10_000 },
    create: { code: "WELCOME100", active: true, discountInPaise: 10_000 }
  });

  const liveClass = await prisma.liveClass.findFirst({
    where: { courseId: course.id, title: "C programming live lab" }
  });

  if (liveClass) {
    await prisma.liveClass.update({
      where: { id: liveClass.id },
      data: {
        startsAt: new Date(Date.now() + 5 * 60 * 1000),
        endsAt: new Date(Date.now() + 65 * 60 * 1000),
        status: "SCHEDULED"
      }
    });
  } else {
    await prisma.liveClass.create({
      data: {
        courseId: course.id,
        scheduleId: activeSchedule.id,
        title: "C programming live lab",
        startsAt: new Date(Date.now() + 5 * 60 * 1000),
        endsAt: new Date(Date.now() + 65 * 60 * 1000),
        status: "SCHEDULED",
        livekitRoom: "benzo-demo-c-live"
      }
    });
  }

  const existingNotification = await prisma.notification.findFirst({
    where: { userId: student.id, type: "DEMO_READY" }
  });
  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        type: "DEMO_READY",
        title: "Your BENZO test workspace is ready",
        body: "Open My Courses to continue C Programming, or purchase Python using the demo referral and coupon codes.",
        linkUrl: "/student/courses"
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "DEMO_DATA_SEEDED",
      entity: "Enrollment",
      entityId: enrollment.id,
      metadata: { studentEmail: student.email, referralCode: referrer.studentProfile.referralCode }
    }
  });

  console.log("Demo accounts ready:");
  console.log("Student: student@benzo.test / Benzo@123");
  console.log("Instructor: instructor@benzo.test / Benzo@123");
  console.log("Admin: admin@benzo.test / Benzo@123");
  console.log("Super Admin: superadmin@benzo.test / Benzo@123");
  console.log("Checkout referral: BENZO-DEMO; coupon: WELCOME100");
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
