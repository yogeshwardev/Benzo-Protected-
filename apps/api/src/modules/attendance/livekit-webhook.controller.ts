import { BadRequestException, Controller, Headers, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebhookReceiver } from "livekit-server-sdk";
import type { Request } from "express";
import { AttendanceService } from "./attendance.service";

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller({ path: "livekit/webhook", version: "1" })
export class LiveKitWebhookController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly config: ConfigService
  ) {}

  @Post()
  async receive(@Req() req: RawBodyRequest, @Headers("authorization") authorization?: string) {
    const apiKey = this.config.get<string>("LIVEKIT_API_KEY");
    const apiSecret = this.config.get<string>("LIVEKIT_API_SECRET");

    if (!apiKey || !apiSecret) {
      throw new UnauthorizedException("LiveKit webhook verification is not configured.");
    }

    const rawBody = req.rawBody?.toString("utf8");
    if (!rawBody) {
      throw new BadRequestException("Missing raw webhook body.");
    }

    let event;
    try {
      event = await new WebhookReceiver(apiKey, apiSecret).receive(rawBody, authorization);
    } catch {
      throw new UnauthorizedException("Invalid LiveKit webhook signature.");
    }

    const liveClassId = this.getLiveClassId(event);
    const userId = event.participant?.identity;

    if (event.event === "participant_joined" && liveClassId && userId) {
      await this.attendance.recordLiveKitJoin({ liveClassId, userId });
    }

    if (event.event === "participant_left" && liveClassId && userId) {
      await this.attendance.recordLiveKitLeave({ liveClassId, userId });
    }

    if (event.event === "room_finished" && liveClassId) {
      await this.attendance.summarizeLiveClassFromWebhook(liveClassId);
    }

    return { received: true };
  }

  private getLiveClassId(event: { participant?: { metadata?: string }; room?: { name?: string } }) {
    const metadata = event.participant?.metadata;

    if (metadata) {
      try {
        const parsed = JSON.parse(metadata) as { liveClassId?: string };
        if (parsed.liveClassId) {
          return parsed.liveClassId;
        }
      } catch {
        return undefined;
      }
    }

    const match = event.room?.name?.match(/^course-.+-class-(.+)-\d+$/);
    return match?.[1];
  }
}
