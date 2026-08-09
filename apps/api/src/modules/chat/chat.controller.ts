import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { ChatService } from "./chat.service";
import { ModerateChatMessageDto } from "./dto/moderate-chat-message.dto";
import { SendChatMessageDto } from "./dto/send-chat-message.dto";

@Controller({ path: "chat", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("courses/:courseId/room")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  getCourseRoom(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.chatService.getCourseRoom(user, courseId);
  }

  @Get("rooms/:roomId/messages")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listMessages(@CurrentUserDecorator() user: CurrentUser, @Param("roomId") roomId: string) {
    return this.chatService.listMessages(user, roomId);
  }

  @Post("rooms/:roomId/messages")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  sendMessage(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("roomId") roomId: string,
    @Body() dto: SendChatMessageDto
  ) {
    return this.chatService.sendMessage(user, roomId, dto);
  }

  @Patch("messages/:messageId/moderate")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  moderateMessage(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("messageId") messageId: string,
    @Body() dto: ModerateChatMessageDto
  ) {
    return this.chatService.moderateMessage(user, messageId, dto);
  }
}
