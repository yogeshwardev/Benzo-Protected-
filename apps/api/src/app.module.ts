import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccessModule } from "./common/access/access.module";
import { RbacModule } from "./common/rbac/rbac.module";
import { HealthModule } from "./modules/health/health.module";
import { ModulesModule } from "./modules/modules.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"]
    }),
    AccessModule,
    RbacModule,
    HealthModule,
    ModulesModule
  ]
})
export class AppModule {}
