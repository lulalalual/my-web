import Link from "next/link";

export default function StudioHomePage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">内容后台</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          管理项目、笔记和首页内容
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/studio/notes",
            title: "笔记",
            body: "创建、编辑、发布 Markdown 笔记。",
          },
          {
            href: "/studio/projects",
            title: "项目",
            body: "维护项目摘要、技术栈和亮点。",
          },
          {
            href: "/studio/settings",
            title: "设置",
            body: "配置首页文案、社交链接和项目顺序。",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-panel rounded-[2rem] border-white/10 bg-white/8 px-6 py-6"
          >
            <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-slate-300">{item.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
