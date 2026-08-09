import { Module } from "@nestjs/common";
import { LiveClassesController } from "./live-classes.controller";
import { LiveClassesService } from "./live-classes.service";
import { LiveKitTokenService } from "./livekit-token.service";

@Module({
  controllers: [LiveClassesController],
  providers: [LiveClassesService, LiveKitTokenService],
  exports: [LiveClassesService]
})
export class LiveClassesModule {}

