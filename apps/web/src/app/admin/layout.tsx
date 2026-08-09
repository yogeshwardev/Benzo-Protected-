import { RoleShell } from "@/components/role-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell mode="admin">{children}</RoleShell>;
}
