import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccessToken, TrackSource, type VideoGrant } from "livekit-server-sdk";

export type LiveKitParticipantRole = "INSTRUCTOR" | "STUDENT";

@Injectable()
export class LiveKitTokenService {
  constructor(private readonly config: ConfigService) {}

  async createRoomToken(input: {
    identity: string;
    name: string;
    room: string;
    role: LiveKitParticipantRole;
    metadata: Record<string, string>;
  }) {
    const apiKey = this.config.get<string>("LIVEKIT_API_KEY");
    const apiSecret = this.config.get<string>("LIVEKIT_API_SECRET");

    if (!apiKey || !apiSecret) {
      if (this.config.get<string>("NODE_ENV", "development") === "production") {
        throw new ServiceUnavailableException("LiveKit is not configured.");
      }

      return {
        token: "development-livekit-token",
        url: this.config.get<string>("LIVEKIT_URL", "ws://localhost:7880"),
        room: input.room
      };
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: input.identity,
      name: input.name,
      metadata: JSON.stringify(input.metadata),
      ttl: this.config.get<string>("LIVEKIT_TOKEN_TTL", "2h")
    });

    token.addGrant(this.createGrant(input.room, input.role));

    return {
      token: await token.toJwt(),
      url: this.config.get<string>("LIVEKIT_URL"),
      room: input.room
    };
  }

  private createGrant(room: string, role: LiveKitParticipantRole): VideoGrant {
    const baseGrant: VideoGrant = {
      room,
      roomJoin: true,
      canSubscribe: true,
      canPublishData: true
    };

    if (role === "INSTRUCTOR") {
      return {
        ...baseGrant,
        roomAdmin: true,
        canPublish: true,
        canPublishSources: [
          TrackSource.MICROPHONE,
          TrackSource.CAMERA,
          TrackSource.SCREEN_SHARE,
          TrackSource.SCREEN_SHARE_AUDIO
        ]
      };
    }

    return {
      ...baseGrant,
      canPublish: true,
      canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA]
    };
  }
}
