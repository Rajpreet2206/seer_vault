import React, { useState } from 'react';
import { Send, Upload } from 'lucide-react';
import axios from 'axios';
import { SearchResult } from './SearchResult';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<any>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:8000/search', null, {
        params: { query: input },
      });
      
      setLastSearchResult(response.data);
      
      const resultText = response.data.found 
        ? `Found: ${response.data.result.filename}`
        : `No files found for "${input}"`;
      
      const assistantMessage = { role: 'assistant', content: resultText };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error searching files' }]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const userMessage = { role: 'user', content: `Uploading ${files.length} file(s)...` };
    setMessages([...messages, userMessage]);

    try {
      for (let file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:8000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const assistantMessage = {
          role: 'assistant',
          content: `✅ ${response.data.filename} uploaded and indexed successfully`,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Upload failed' }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">SeerVault</h1>
        <p className="text-sm text-gray-600">Semantic file search & management</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Start a conversation</p>
              <p className="text-gray-400 text-sm mt-2">Upload files or ask me to find them</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Search Result Display */}
            {lastSearchResult && (
              <div className="mt-4">
                <SearchResult 
                  result={lastSearchResult.found ? lastSearchResult.result : null}
                  query={lastSearchResult.query}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <label className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition cursor-pointer">
            <Upload size={20} className="text-gray-600" />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.txt"
            />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Search or ask about your files..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          <button
            onClick={handleSendMessage}
            disabled={uploading}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
