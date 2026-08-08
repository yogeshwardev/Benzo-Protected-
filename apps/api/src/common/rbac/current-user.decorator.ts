import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { CurrentUser } from "./current-user";

export const CurrentUserDecorator = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUser | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: CurrentUser }>();
    return request.user;
  }
);

