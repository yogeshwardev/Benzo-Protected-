import { Module } from "@nestjs/common";
import { AdminsModule } from "./admins/admins.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { AuthModule } from "./auth/auth.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { FinancialModule } from "./financial/financial.module";
import { InstructorsModule } from "./instructors/instructors.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { LearningModule } from "./learning/learning.module";
import { LiveClassesModule } from "./live-classes/live-classes.module";
import { MaterialsModule } from "./materials/materials.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { PricingModule } from "./pricing/pricing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuizzesModule } from "./quizzes/quizzes.module";
import { ReferralsModule } from "./referrals/referrals.module";
import { RecordingsModule } from "./recordings/recordings.module";
import { StudentsModule } from "./students/students.module";
import { UsersModule } from "./users/users.module";
import { WalletModule } from "./wallet/wallet.module";
import { WithdrawalsModule } from "./withdrawals/withdrawals.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    AdminsModule,
    InstructorsModule,
    CoursesModule,
    EnrollmentsModule,
    PricingModule,
    OrdersModule,
    PaymentsModule,
    CouponsModule,
    ReferralsModule,
    WalletModule,
    WithdrawalsModule,
    InvoicesModule,
    FinancialModule,
    LearningModule,
    MaterialsModule,
    RecordingsModule,
    LiveClassesModule,
    AttendanceModule,
    AssignmentsModule,
    QuizzesModule
  ]
})
export class ModulesModule {}
