import { Module } from "@nestjs/common";
import { AdminsModule } from "./admins/admins.module";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { InstructorsModule } from "./instructors/instructors.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StudentsModule } from "./students/students.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    AdminsModule,
    InstructorsModule,
    CoursesModule,
    EnrollmentsModule
  ]
})
export class ModulesModule {}
