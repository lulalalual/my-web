import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export function NoteArticle({ markdown }: { markdown: string }) {
  return (
    <article className="glass-panel rounded-[2.5rem] px-6 py-8 text-slate-700 md:px-10">
      <div className="mx-auto max-w-3xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mt-10 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-8 text-xl font-semibold text-slate-900">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mt-5 text-base leading-8 text-slate-700">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mt-5 list-disc space-y-3 pl-6 text-base leading-8 text-slate-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mt-5 list-decimal space-y-3 pl-6 text-base leading-8 text-slate-700">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="mt-6 rounded-[1.5rem] border border-white/70 bg-white/55 px-5 py-4 text-slate-600">
                {children}
              </blockquote>
            ),
            pre: ({ children }) => (
              <pre className="mt-6 overflow-x-auto rounded-[1.75rem] bg-slate-950 px-5 py-4 text-sm text-slate-100">
                {children}
              </pre>
            ),
            code: ({ inline, children }) =>
              inline ? (
                <code className="rounded-md bg-slate-900/8 px-1.5 py-1 font-mono text-[0.92em] text-sky-700">
                  {children}
                </code>
              ) : (
                <code className="font-mono">{children}</code>
              ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-sky-600 underline decoration-sky-300 underline-offset-4"
              >
                {children}
              </a>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
