import type { UserRole } from "@benzo/types";

export interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
}

