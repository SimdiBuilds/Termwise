import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { AlertTriangle, CheckCircle, Info, BookOpen } from 'lucide-react';
import { preprocessLatex } from './MathMarkdown.tsx';

interface LessonContentRendererProps {
  content: string;
}

export const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({ content }) => {
  if (!content) return null;

  const processedContent = preprocessLatex(content);

  return (
    <div className="prose-content text-slate-800 space-y-4">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h3: ({ children }) => {
            const headingText = String(children);
            const isTrapHeading = headingText.toLowerCase().includes('trap') || headingText.toLowerCase().includes('misconception');
            const isRuleHeading = headingText.toLowerCase().includes('rule') || headingText.toLowerCase().includes('condition');
            const isExampleHeading = headingText.toLowerCase().includes('example');

            return (
              <h4
                className={`text-base sm:text-lg font-bold tracking-tight mt-6 mb-3 pb-2 border-b flex items-center gap-2 ${
                  isTrapHeading
                    ? 'text-rose-900 border-rose-150'
                    : isRuleHeading
                    ? 'text-indigo-900 border-indigo-100'
                    : isExampleHeading
                    ? 'text-blue-900 border-blue-100'
                    : 'text-slate-900 border-slate-100'
                }`}
              >
                <span
                  className={`w-1.5 h-4 rounded-full inline-block shrink-0 ${
                    isTrapHeading
                      ? 'bg-rose-500'
                      : isRuleHeading
                      ? 'bg-indigo-600'
                      : isExampleHeading
                      ? 'bg-blue-600'
                      : 'bg-slate-400'
                  }`}
                />
                <span>{children}</span>
              </h4>
            );
          },
          p: ({ children }) => {
            const text = String(children);
            // Check if this paragraph is a Common Mistake or Caution block
            if (text.includes('Common Mistake') || text.includes('⚠️')) {
              return (
                <div className="my-3.5 p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-1.5 text-sm text-rose-950">
                  <div className="flex items-center gap-2 font-semibold text-rose-800 text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Common Exam Trap</span>
                  </div>
                  <div className="leading-relaxed pl-6 text-slate-800 font-normal">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base my-2.5 font-normal">
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <span className="italic text-indigo-800 font-medium">{children}</span>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2.5 my-3 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2.5 my-3 pl-1 list-decimal list-inside text-slate-700">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          hr: () => <div className="my-6 border-t border-slate-100" />,
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-4 border-indigo-300 bg-indigo-50/50 py-2.5 pr-3 rounded-r-lg text-sm text-slate-700 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">
              {children}
            </code>
          ),
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};
