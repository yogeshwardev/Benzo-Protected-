import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

interface LiveKitGrant {
  room: string;
  roomJoin: boolean;
  canPublish: boolean;
  canSubscribe: boolean;
  canPublishData: boolean;
}

@Injectable()
export class LiveKitTokenService {
  constructor(private readonly config: ConfigService) {}

  createRoomToken(input: {
    identity: string;
    name: string;
    room: string;
    grants: LiveKitGrant;
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

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: apiKey,
      sub: input.identity,
      name: input.name,
      metadata: JSON.stringify(input.metadata),
      nbf: now - 10,
      exp: now + 60 * 60 * 2,
      video: input.grants
    };

    return {
      token: this.signJwt(payload, apiSecret),
      url: this.config.get<string>("LIVEKIT_URL"),
      room: input.room
    };
  }

  private signJwt(payload: Record<string, unknown>, secret: string) {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = this.base64Url(JSON.stringify(header));
    const encodedPayload = this.base64Url(JSON.stringify(payload));
    const signature = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private base64Url(value: string) {
    return Buffer.from(value).toString("base64url");
  }
}

