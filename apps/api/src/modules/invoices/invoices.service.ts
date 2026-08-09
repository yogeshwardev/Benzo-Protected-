import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getInvoice(user: CurrentUser, invoiceNo: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNo },
      include: {
        order: {
          include: {
            student: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            },
            course: { select: { title: true, slug: true } },
            payments: true
          }
        }
      }
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found.");
    }

    if (user.role === "STUDENT" && invoice.order.student.user.id !== user.id) {
      throw new ForbiddenException("Invoice does not belong to this student.");
    }

    return invoice;
  }
}

