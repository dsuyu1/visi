import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { slugify } from "@/lib/format";

const sanitizeSchema = {
  ...(defaultSchema as typeof defaultSchema),
  tagNames: [...(defaultSchema.tagNames ?? []), "mark", "u", "o-text"],
};

function nodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (children && typeof children === "object" && "props" in (children as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return nodeText((children as any).props?.children);
  }
  return "";
}

export function AcademyMarkdown({ markdown }: { markdown: string }) {
  return (
    <article className="prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ children }) => {
            const id = slugify(nodeText(children));
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children }) => {
            const id = slugify(nodeText(children));
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const id = slugify(nodeText(children));
            return <h3 id={id}>{children}</h3>;
          },
          mark: ({ children }) => <mark className="text-highlight">{children}</mark>,
          u: ({ children }) => <u className="ink-underline">{children}</u>,
          "o-text": ({ children }) => <span className="text-accent">{children}</span>,
        }}
      >
        {markdown}
      </Markdown>
    </article>
  );
}

