import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { MaterialsService } from "./materials.service";

@Controller({ path: "materials", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listCourseMaterials(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.materialsService.listCourseMaterials(user, courseId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createMaterial(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateMaterialDto) {
    return this.materialsService.createMaterial(user, dto);
  }
}

