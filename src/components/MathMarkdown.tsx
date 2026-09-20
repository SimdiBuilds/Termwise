import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathMarkdownProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Normalizes LaTeX math notation so remark-math & rehype-katex render formulas properly:
 * - Converts \[ ... \] block math to $$ ... $$
 * - Converts \( ... \) inline math to $ ... $
 * - Converts standalone LaTeX formulas without delimiters (e.g. \frac{a}{b}, x^2) into $ ... $ if needed
 * - Converts unicode bullet points (•) into markdown list items
 */
export function preprocessLatex(content: string): string {
  if (!content) return '';

  let processed = content;

  // Fix JSON unescaping issues where backslashes got collapsed into control characters:
  // \u000c (Form Feed) -> \\f (restores \frac, \flat, \fey, etc.)
  processed = processed.replace(/\u000c/g, '\\f');
  // \u0008 (Backspace) -> \\b (restores \begin, \beta, \bar, etc.)
  processed = processed.replace(/\u0008/g, '\\b');
  // \u000b (Vertical Tab) -> \\v (restores \vec, etc.)
  processed = processed.replace(/\u000b/g, '\\v');
  // \t (Tab) followed by typical LaTeX command letters -> \\t
  processed = processed.replace(/\t(ext|heta|imes)/g, '\\t$1');

  // Convert \[ ... \] block math to $$ ... $$
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n\n$$${math.trim()}$$\n\n`);

  // Convert \( ... \) inline math to $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);

  // If a string contains LaTeX commands like \text, \frac, \sqrt, etc., but lacks $ delimiters, wrap it in $ ... $
  if (
    (/\\(text|frac|sqrt|sum|int|alpha|beta|theta|pi|cdot|times)/.test(processed) || /\^[0-9a-zA-Z\{\}]+/.test(processed)) &&
    !processed.includes('$')
  ) {
    processed = `$${processed}$`;
  }

  // Convert unicode bullets to standard markdown list items
  processed = processed
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('• ') || trimmed.startsWith('•\t')) {
        return `- ${trimmed.slice(2).trim()}`;
      }
      return line;
    })
    .join('\n');

  return processed;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className = '', inline = false }) => {
  if (!content) return null;

  const text = preprocessLatex(content);

  if (inline) {
    return (
      <span className={`inline-math-wrapper ${className}`}>
        <Markdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <span>{children}</span>,
          }}
        >
          {text}
        </Markdown>
      </span>
    );
  }

  return (
    <div className={`math-markdown-wrapper ${className}`}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </Markdown>
    </div>
  );
};
