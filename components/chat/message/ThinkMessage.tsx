import React from 'react';
import { CloudIcon } from 'lucide-react';

const ThinkMessage = ({ content }: { content: string }) => {
  const parseContent = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Trim the initial text
    text = text.trim();

    // Check for incomplete think tag
    if (text.includes('<think>') && !text.includes('</think>')) {
      const startIndex = text.indexOf('<think>');
      const beforeText = text.slice(0, startIndex).trim();
      const thinkContent = text.slice(startIndex + 7).trim(); // 7 is length of '<think>'
      
      if (beforeText) {
        parts.push({
          type: 'text',
          content: beforeText
        });
      }
      
      if (thinkContent) {
        parts.push({
          type: 'think',
          content: thinkContent
        });
      }
      
      return parts;
    }
    
    // Regular expression to match complete <think>...</think> blocks
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const thinkRegex = /<think>(.*?)<\/think>/gs;
    let match;
    
    while ((match = thinkRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index).trim();
        if (beforeText) {
          parts.push({
            type: 'text',
            content: beforeText
          });
        }
      }
      
      const thinkContent = match[1].trim();
      if (thinkContent) {
        parts.push({
          type: 'think',
          content: thinkContent
        });
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < text.length) {
      const afterText = text.slice(currentIndex).trim();
      if (afterText) {
        parts.push({
          type: 'text',
          content: afterText
        });
      }
    }
    
    return parts;
  };

  const formattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line.trim()}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  const parts = parseContent(content);
  
  return (
    <div className="flex flex-col gap-2">
      {parts.map((part, index) => {
        if (part.type === 'think') {
          return (
            <div 
              key={index}
              className="flex items-start gap-2 text-sm text-blue-400 pb-5"
            >
              <CloudIcon className="w-4 h-4 mt-1 flex-shrink-0" />
              <div>{formattedContent(part.content)}</div>
            </div>
          );
        }
        return <div key={index}>{formattedContent(part.content)}</div>;
      })}
    </div>
  );
};

export default ThinkMessage;