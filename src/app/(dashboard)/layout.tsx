import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="absolute inset-0 overflow-auto">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
