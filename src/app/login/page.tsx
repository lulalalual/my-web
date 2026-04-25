import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <div className="w-full rounded-[2rem] border border-white/60 bg-white/50 p-8 shadow-[var(--shadow)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">Sign in to Studio</h1>
        <p className="mt-3 text-sm text-slate-500">
          GitHub auth is enabled, but only the owner account can edit content.
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
