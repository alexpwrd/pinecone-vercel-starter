// File path: pinecone-vercel-starter/src/app/components/Chat/Messages.tsx
// This file handles the display of messages in the chat interface

import { Message } from "ai";
import { useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Messages({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="border-2 border-gray-600 p-6 rounded-lg overflow-y-auto flex-grow flex flex-col bg-gray-700 max-h-screen" style={{ maxWidth: 'none', margin: '0' }}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${
            msg.role === "assistant" ? "text-green-300" : "text-blue-300"
          } my-2 p-3 rounded shadow-md hover:shadow-lg transition-shadow duration-200 flex slide-in-bottom bg-gray-800 border border-gray-600 message-glow`}
        >
          <div className="rounded-tl-lg bg-gray-800 p-2 border-r border-gray-600 flex items-center">
            {msg.role === "assistant" ? "🤖" : "🧑‍💻"}
          </div>
          <div className="ml-2 flex items-center text-gray-100">
            <ReactMarkdown 
                className="markdown-table"
                children={msg.content} 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]} 
                components={{
                  table: ({node, ...props}) => (
                    <table {...props} style={{borderCollapse: 'collapse', width: '100%', maxWidth: 'none', margin: '0'}} />
                  ),
                  th: ({node, ...props}) => (
                    <th {...props} style={{border: '1px solid #ccc', padding: '8px 12px', backgroundColor: '#0b2a38'}} />
                  ),
                  td: ({node, ...props}) => (
                    <td {...props} style={{border: '1px solid #ccc', padding: '8px 12px'}} />
                  ),
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter 
                        style={{ 
                          ...solarizedlight, 
                          maxWidth: 'none', // Changed the maxWidth to 'none'
                          overflowX: 'auto' 
                        }} 
                        language={match[1] === 'sql' || match[1] === 'cql' ? 'markup' : match[1]} 
                        PreTag="div" 
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code style={{backgroundColor: '#444', padding: '0.2rem 0.4rem', borderRadius: '4px', color: '#ddd'}} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
            />
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

