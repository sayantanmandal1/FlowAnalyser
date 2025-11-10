import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Database, Table as TableIcon } from 'lucide-react';
import { chatApi } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  results?: any[];
  error?: string;
  timestamp: Date;
}

export function ChatWithData() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call actual backend API
      const response = await chatApi.sendMessage(query);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.error 
          ? `Error: ${response.error}`
          : response.explanation || 'I\'ve executed your query and found the following results:',
        sql: response.sql,
        results: response.data,
        error: response.error,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure the AI server is running and try again.',
        error: error.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQueries = [
    "What's the total spend in the last 90 days?",
    "List top 5 vendors by spend",
    "Show overdue invoices as of today",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="mb-1">Chat with Data</h2>
        <p className="text-xs text-gray-500">
          Ask questions about your invoices and get instant insights powered by AI
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Database className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-gray-600 mb-2">Start asking questions</h3>
            <p className="text-sm text-gray-500 mb-6">
              Try one of these example queries:
            </p>
            <div className="space-y-2 w-full max-w-md">
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(query)}
                  className="w-full px-4 py-3 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* SQL Display */}
              {message.sql && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Generated SQL:</span>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    {message.sql}
                  </pre>
                </div>
              )}

              {/* Error Display */}
              {message.error && (
                <div className="mt-4 pt-4 border-t border-red-300">
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {message.error}
                  </div>
                </div>
              )}

              {/* Results Table */}
              {message.results && message.results.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <TableIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Results:</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-gray-300 rounded">
                      <thead className="bg-gray-200">
                        <tr>
                          {Object.keys(message.results[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left border-b border-gray-300">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {message.results.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-200 last:border-0">
                            {Object.values(row).map((value: any, colIdx) => (
                              <td key={colIdx} className="px-3 py-2">
                                {typeof value === 'number' 
                                  ? value.toLocaleString('en-US', { 
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2 
                                    })
                                  : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Analyzing your query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
