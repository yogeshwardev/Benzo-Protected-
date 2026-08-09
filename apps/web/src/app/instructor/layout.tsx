import { RoleShell } from "@/components/role-shell";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell mode="instructor">{children}</RoleShell>;
}
