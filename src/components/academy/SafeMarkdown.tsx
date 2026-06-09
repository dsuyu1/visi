import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
  ...(defaultSchema as typeof defaultSchema),
  tagNames: [...(defaultSchema.tagNames ?? []), "mark", "u", "o-text"],
};

export function SafeMarkdown({
  markdown,
  inline = false,
  className,
}: {
  markdown: string;
  inline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={
          inline
            ? {
                p: ({ children }) => <span>{children}</span>,
              }
            : undefined
        }
      >
        {markdown}
      </Markdown>
    </div>
  );
}

