import { Module } from "@nestjs/common";
import { AdminsModule } from "./admins/admins.module";
import { AuthModule } from "./auth/auth.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { InstructorsModule } from "./instructors/instructors.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { PricingModule } from "./pricing/pricing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReferralsModule } from "./referrals/referrals.module";
import { StudentsModule } from "./students/students.module";
import { UsersModule } from "./users/users.module";
import { WalletModule } from "./wallet/wallet.module";

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
    WalletModule
  ]
})
export class ModulesModule {}
