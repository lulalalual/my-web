"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  const unavailable = !createBrowserSupabaseClient();

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading || unavailable}
      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {unavailable
        ? "请先配置 Supabase 以启用 GitHub 登录"
        : loading
          ? "正在跳转..."
          : "使用 GitHub 登录"}
    </button>
  );
}
