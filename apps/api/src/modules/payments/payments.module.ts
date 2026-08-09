import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentSettlementService } from "./payment-settlement.service";
import { RazorpayService } from "./razorpay.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentSettlementService, RazorpayService],
  exports: [PaymentSettlementService, RazorpayService]
})
export class PaymentsModule {}

