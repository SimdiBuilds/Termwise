import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { preprocessLatex } from './MathMarkdown.tsx';

interface LessonContentRendererProps {
  content: string;
  className?: string;
}

/** Flatten React children to plain text (String(children) returns "[object Object]" for nested nodes). */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return '';
}

const CAUTION = /^(common mistake|watch out|teacher tip|careful|note)\b/i;

/**
 * Renders lesson markdown with restrained typography: headings, rule blockquotes,
 * display equations and lists. No boxes around every paragraph.
 */
export const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;
  const processed = preprocessLatex(content.replace(/[\u2600-\u27BF\uFE0F\u{1F300}-\u{1FAFF}]/gu, '').replace(/^(\s*)[ \t]+/gm, '$1'));

  return (
    <div className={`lesson-body max-w-[68ch] text-ink ${className}`}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h2 className="t-title mb-3 mt-10 first:mt-0">{children}</h2>,
          h2: ({ children }) => <h3 className="t-h2 mb-2 mt-9 first:mt-0">{children}</h3>,
          h3: ({ children }) => <h4 className="t-h2 mb-2 mt-8 first:mt-0">{children}</h4>,
          h4: ({ children }) => <h5 className="t-body mb-1.5 mt-6 font-semibold first:mt-0">{children}</h5>,
          p: ({ children }) => {
            const t = textOf(children).trim().replace(/^[^A-Za-z]+/, '');
            if (CAUTION.test(t)) {
              return <p className="!mb-4 border-l-2 border-warn/70 pl-4 text-ink-2">{children}</p>;
            }
            return <p>{children}</p>;
          },
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-brand-500 pl-5 [&>p:last-child]:mb-0">{children}</blockquote>
          ),
          ul: ({ children }) => <ul className="mb-4 list-disc space-y-1.5 pl-6 marker:text-ink-4">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1.5 pl-6 marker:text-ink-3 marker:font-medium">{children}</ol>,
          li: ({ children }) => <li className="pl-1 [&>p]:mb-1">{children}</li>,
          hr: () => <hr className="my-8 border-line" />,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-brand-700 underline underline-offset-2 hover:text-brand-600">{children}</a>
          ),
          code: ({ children }) => <code className="rounded-sm bg-sunken px-1.5 py-0.5 text-[0.9em]">{children}</code>,
          pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-md bg-sunken p-4 text-[0.9em]">{children}</pre>,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto"><table className="w-full border-collapse t-body">{children}</table></div>
          ),
          th: ({ children }) => <th className="border-b border-line-strong px-3 py-2 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top">{children}</td>,
        }}
      >
        {processed}
      </Markdown>
    </div>
  );
};
