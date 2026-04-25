import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <div className="w-full rounded-[2rem] border border-white/60 bg-white/50 p-8 shadow-[var(--shadow)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">登录内容后台</h1>
        <p className="mt-3 text-sm text-slate-500">
          当前使用 GitHub 登录，且只有站点所有者账号可以进入编辑区。
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
