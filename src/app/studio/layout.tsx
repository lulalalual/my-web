import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { getServerViewer } from "@/lib/supabase/server";
import { isOwnerUsername } from "@/lib/auth";

export default async function StudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await getServerViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (!isOwnerUsername(viewer.user_metadata.user_name)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.92),_rgba(2,6,23,1)_55%)] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <StudioSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
