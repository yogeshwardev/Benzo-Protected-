import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../../modules/prisma/prisma.module";
import { CourseAccessService } from "./course-access.service";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CourseAccessService],
  exports: [CourseAccessService]
})
export class AccessModule {}

