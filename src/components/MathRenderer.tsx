import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    // Replace $$...$$ first (block math)
    let processed = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-2.5 overflow-x-auto py-1 text-center font-mono text-cyan-300">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return `<pre class="my-2 p-2 bg-white/5 rounded text-cyan-300 font-mono text-sm overflow-x-auto">${math}</pre>`;
      }
    });

    // Replace $...$ next (inline math)
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return `<span class="inline-block px-1 font-mono text-cyan-200">${katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })}</span>`;
      } catch {
        return `<code class="px-1 text-cyan-300 font-mono text-sm">${math}</code>`;
      }
    });

    // Convert Markdown bold **text** to bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Convert newlines to paragraphs/breaks while preserving tags
    processed = processed.replace(/\n\n/g, '<div class="h-2"></div>');
    processed = processed.replace(/\n/g, '<br />');

    return processed;
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none text-gray-200 leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
