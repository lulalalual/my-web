import type { ReactNode } from "react";
import { redirect } from "next/navigation";
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

  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
