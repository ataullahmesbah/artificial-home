/**
 * Minimal, safe text formatter for admin-authored content.
 * Supports paragraphs (blank line), "## " headings and "- " bullet lists.
 * Everything is rendered as React text — no HTML injection is possible.
 */
export function RichText({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose-content text-[17px] leading-[1.9]">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const out: React.ReactNode[] = [];
        let para: string[] = [];
        let list: string[] = [];
        const flush = () => {
          if (para.length) out.push(<p key={`p${out.length}`}>{para.join(" ")}</p>);
          if (list.length)
            out.push(
              <ul key={`u${out.length}`} className="mb-5 list-disc space-y-1.5 pl-6 marker:text-accent-ink">
                {list.map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            );
          para = [];
          list = [];
        };
        for (const line of lines) {
          if (line.startsWith("## ")) {
            flush();
            out.push(<h2 key={`h${out.length}`}>{line.slice(3)}</h2>);
          } else if (line.startsWith("- ")) {
            if (para.length) flush();
            list.push(line.slice(2));
          } else {
            if (list.length) flush();
            para.push(line);
          }
        }
        flush();
        return <div key={i}>{out}</div>;
      })}
    </div>
  );
}
