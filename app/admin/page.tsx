import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { AdminPanel } from "@/components/admin/admin-panel";
import { emailIsAdmin } from "@/lib/auth-role";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true },
  });
  if (!user || (user.role !== "ADMIN" && !emailIsAdmin(user.email))) redirect("/");

  return <AdminPanel email={user.email} />;
}
