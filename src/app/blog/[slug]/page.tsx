export const runtime = "edge";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { TableOfContents } from "@/components/TableOfContents";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BLOG_POSTS } from "@/lib/content";
import { formatDate, readingTime, extractHeadings, slugify } from "@/lib/format";

const sanitizeSchema = {
  ...(defaultSchema as typeof defaultSchema),
  tagNames: [...(defaultSchema.tagNames ?? []), "mark", "u", "o-text"],
};

/** Pull the plain-text string out of react-markdown's `children` prop */
function nodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (children && typeof children === "object" && "props" in (children as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return nodeText((children as any).props?.children);
  }
  return "";
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const timeToRead = readingTime(post.content);
  const headings  = extractHeadings(post.content);

  return (
    <div>
      {/* --- Hero banner ---------------------------------------------------
          Full-width gradient background, title at the bottom,
          then a linear-gradient overlay that fades seamlessly into #f9f9f9.
      ------------------------------------------------------------------- */}
      <div
        className="blog-hero"
        style={{
          background: post.coverGradient,
          minHeight: "min(58vh, 540px)",
        }}
      >
        {/* Noise texture for depth */}
        <div className="blog-hero-noise" aria-hidden />

        {/* Title block — sits at the bottom of the banner */}
        <div className="relative z-10 flex min-h-[inherit] flex-col justify-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-32 text-center">
            {/* Category badge */}
            <span
              className="mb-5 inline-block border px-3 py-1 text-[11px] font-medium tracking-widest uppercase font-sans"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {post.category}
            </span>

            {/* Title */}
            <h1
              className="mx-auto max-w-3xl font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.4rem)" }}
            >
              {post.title}
            </h1>

            {/* Excerpt */}
            <p
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)", fontWeight: 300 }}
            >
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Gradient fade into page background */}
        <div className="blog-hero-fade" aria-hidden />
      </div>

      {/* --- Metadata bar --------------------------------------------------
          publication date · category · reading time · author
      ------------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-8 text-xs font-medium tracking-wide text-muted-light">
            <span>{formatDate(post.date)}</span>
            <span aria-hidden className="text-border">·</span>
            <span>{post.category}</span>
            <span aria-hidden className="text-border">·</span>
            <span>{timeToRead}</span>
            <span aria-hidden className="text-border">·</span>
              <span>
                {post.author.length === 1
                 ? post.author[0]
                 : post.author.slice(0, -1).join(", ") +
                   " & " +
                   post.author[post.author.length - 1]}
              </span>

            {/* Tags pushed to the right */}
            <div className="ml-auto flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="border border-border px-2.5 py-1 text-[11px] text-muted-light"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* --- Two-column content area -------------------------------------- */}
      <div className="mx-auto max-w-7xl px-6 pb-32 pt-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px]">

          {/* ?? Article ?? */}
          <ScrollReveal>
            <article className="prose">
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={{
                  /* Strip the top-level h1 — the title is already in the banner */
                  h1: () => null,

                  h2: ({ children }) => {
                    const id = slugify(nodeText(children));
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const id = slugify(nodeText(children));
                    return <h3 id={id}>{children}</h3>;
                  },
                  h4: ({ children }) => <h4>{children}</h4>,

                  p:  ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  ol: ({ children }) => <ol>{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,

                  a: ({ href, children }) => (
                    <a href={href ?? "#"}>{children}</a>
                  ),

                  code: ({ children, className }) => {
                    // react-markdown wraps fenced blocks in <pre><code>
                    // Inline code has no className
                    return <code className={className ?? ""}>{children}</code>;
                  },

                  pre: ({ children }) => <pre>{children}</pre>,

                  blockquote: ({ children }) => (
                    <blockquote>{children}</blockquote>
                  ),

                  hr: () => <hr />,

                  strong: ({ children }) => <strong>{children}</strong>,
                  em:     ({ children }) => <em>{children}</em>,
                  mark:   ({ children }) => <mark className="text-highlight">{children}</mark>,
                  u:      ({ children }) => <u className="ink-underline">{children}</u>,
                  "o-text": ({ children }) => <span className="text-accent">{children}</span>,
                }}
              >
                {post.content}
              </Markdown>
            </article>
          </ScrollReveal>

          {/* ?? Sidebar ?? */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">

              {/* Table of contents */}
              <TableOfContents headings={headings} />

              {/* Divider */}
              {headings.length >= 2 && (
                <div className="border-t border-border" />
              )}

              {/* Post meta (repeated compactly in sidebar) */}
              <div className="space-y-4">
                <p className="field-label">About this post</p>
                <dl className="space-y-2 text-xs text-muted-light">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-light">Published</dt>
                    <dd className="text-right text-foreground/70">{formatDate(post.date)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-light">Reading time</dt>
                    <dd className="text-foreground/70">{timeToRead}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-light">Category</dt>
                    <dd className="text-foreground/70">{post.category}</dd>
                  </div>
                  {post.author.map((a) => (
                    <div key={a} className="flex justify-between gap-4">
                      <dt className="text-muted-light">Author</dt>
                      <dd className="text-right text-foreground/70">{a}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Back to blog */}
              <Link
                href="/blog"
                className="work-arrow block text-xs font-medium text-muted-light hover:text-foreground transition-colors"
              >
                <span>←</span> All posts
              </Link>
            </div>
          </aside>
        </div>

        {/* Mobile back link */}
        <div className="mt-16 border-t border-border pt-10 lg:hidden">
          <Link
            href="/blog"
            className="work-arrow text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            <span>←</span> Back to blog
          </Link>
        </div>
      </div>
    </div>
  );
}
