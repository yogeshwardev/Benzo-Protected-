import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CertificatesService } from "./certificates.service";
import { RevokeCertificateDto } from "./dto/revoke-certificate.dto";

@Controller({ path: "certificates", version: "1" })
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get("verify/:verificationCode")
  verifyCertificate(@Param("verificationCode") verificationCode: string) {
    return this.certificatesService.verifyCertificate(verificationCode);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  listMine(@CurrentUserDecorator() user: CurrentUser) {
    return this.certificatesService.listMyCertificates(user.id);
  }

  @Get("me/courses/:courseId/eligibility")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  getMyEligibility(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.certificatesService.getMyEligibility(user.id, courseId);
  }

  @Post("me/courses/:courseId/issue")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  issueMine(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.certificatesService.issueMyCertificate(user.id, courseId);
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN")
  listForAdmin() {
    return this.certificatesService.listCertificatesForAdmin();
  }

  @Post("admin/courses/:courseId/students/:studentId/issue")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN")
  issueForStudent(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("courseId") courseId: string,
    @Param("studentId") studentId: string
  ) {
    return this.certificatesService.issueCertificateForStudent(user, courseId, studentId);
  }

  @Patch(":certificateId/revoke")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN")
  revokeCertificate(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("certificateId") certificateId: string,
    @Body() dto: RevokeCertificateDto
  ) {
    return this.certificatesService.revokeCertificate(user.id, certificateId, dto);
  }
}
