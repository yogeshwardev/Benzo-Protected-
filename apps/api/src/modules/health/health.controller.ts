import { Controller, Get } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { PrismaService } from "../prisma/prisma.service";

@Controller({ path: "health", version: "1" })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      status: "ready",
      service: BENZO.name,
      checks: {
        database: "ok"
      },
      timestamp: new Date().toISOString()
    };
  }
}
