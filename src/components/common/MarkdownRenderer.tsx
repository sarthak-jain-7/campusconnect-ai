import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="my-2 pl-6 list-decimal space-y-1 text-slate-200">
              {listItems.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="my-2 pl-6 list-disc space-y-1 text-slate-200">
              {listItems.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const [headers, , ...rows] = tableRows;
        elements.push(
          <div key={`table-wrapper-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-slate-700/60 shadow-sm">
            <table className="min-w-full divide-y divide-slate-700/80 text-left text-xs sm:text-sm">
              <thead className="bg-slate-800/80 text-slate-200 font-semibold">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2.5" dangerouslySetInnerHTML={{ __html: formatInline(h.trim()) }} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const formatInline = (str: string): string => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700/50">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table line
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        inTable = true;
        const cells = line.split('|').slice(1, -1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        flushList();
        const quoteContent = line.replace(/^>\s*/, '');
        elements.push(
          <div key={`quote-${i}`} className="my-2.5 border-l-4 border-indigo-500 bg-indigo-950/30 px-3.5 py-2 text-indigo-200 text-sm rounded-r-md">
            <span dangerouslySetInnerHTML={{ __html: formatInline(quoteContent) }} />
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="text-base sm:text-lg font-semibold text-indigo-300 mt-3 mb-1 font-display flex items-center gap-1.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('### ', '')) }} />
          </h4>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 font-display border-b border-slate-800 pb-1">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('## ', '')) }} />
          </h3>
        );
        continue;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 font-display">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('# ', '')) }} />
          </h2>
        );
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-800" />);
        continue;
      }

      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(numMatch[2]);
        continue;
      }

      // Bullet list
      const bulletMatch = line.match(/^[-*•]\s+(.*)/);
      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(bulletMatch[1]);
        continue;
      }

      // Normal paragraph
      if (line.trim() === '') {
        flushList();
        continue;
      }

      flushList();
      elements.push(
        <p key={`p-${i}`} className="my-1.5 text-slate-200 leading-relaxed text-sm sm:text-base">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    }

    flushList();
    flushTable();

    return elements;
  };

  return <div className={`space-y-1 ${className}`}>{renderFormattedText(content)}</div>;
};
