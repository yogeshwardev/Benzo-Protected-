import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { LiveKitWebhookController } from "./livekit-webhook.controller";

@Module({
  controllers: [AttendanceController, LiveKitWebhookController],
  providers: [AttendanceService]
})
export class AttendanceModule {}
