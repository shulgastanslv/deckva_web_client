import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/admin/admin-panel";
import { emailIsAdmin } from "@/lib/auth-role";
import { getUserId } from "@/lib/auth/session";
import { isPlatformAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const userId = await getUserId();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  if (!user || (!isPlatformAdmin(user.role) && !emailIsAdmin(user.email))) {
    redirect("/");
  }

  return <AdminPanel email={user.email} />;
}
