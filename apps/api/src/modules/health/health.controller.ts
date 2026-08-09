import { Controller, Get } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

@Controller({ path: "health", version: "1" })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  @Get()
  check() {
    return {
      status: "ok",
      service: BENZO.name,
      timestamp: new Date().toISOString()
    };
  }

  @Get("ready")
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    const livekit = await this.checkLiveKit();

    return {
      status: "ready",
      service: BENZO.name,
      checks: {
        database: "ok",
        livekit
      },
      timestamp: new Date().toISOString()
    };
  }

  private async checkLiveKit() {
    const livekitUrl = this.config.get<string>("LIVEKIT_URL");

    if (!livekitUrl) {
      return "not_configured";
    }

    try {
      const healthUrl = livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
      const response = await fetch(healthUrl, { method: "GET", signal: AbortSignal.timeout(3000) });
      return response.ok || response.status === 404 ? "reachable" : "unhealthy";
    } catch {
      return "unreachable";
    }
  }
}
