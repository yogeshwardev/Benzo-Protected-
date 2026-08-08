import { Controller, Get } from "@nestjs/common";
import { BENZO } from "@benzo/shared";

@Controller({ path: "health", version: "1" })
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: BENZO.name,
      timestamp: new Date().toISOString()
    };
  }
}

