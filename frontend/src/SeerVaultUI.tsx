import React, { useState } from 'react';
import { Send, Upload, Sparkles, File, Trash2, Clock, HardDrive } from 'lucide-react';

interface UploadedFile {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

interface SearchResult {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  relevance_score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SeerVaultUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [lastSearchResult, setLastSearchResult] = useState<SearchResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

    const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages([...messages, userMessage]);
    const query = input;
    setInput('');

    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.found) {
        setLastSearchResult(data.result);
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.response, // Use AI-generated response
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setLastSearchResult(null);
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.response || `No files found matching "${query}".`,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const assistantMessage = {
        role: 'assistant' as const,
        content: '⚠️ Error searching files.',
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    try {
      for (let file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        const newFile: UploadedFile = {
          file_id: data.file_id,
          filename: data.filename,
          file_type: data.filename.split('.').pop()?.toLowerCase() || '',
          size: Math.random() * 5000000,
          uploaded_at: new Date().toISOString(),
        };

        setUploadedFiles(prev => [...prev, newFile]);

        const assistantMessage: Message = {
          role: 'assistant',
          content: `✅ ${data.filename} uploaded successfully!`,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const assistantMessage: Message = {
        role: 'assistant',
        content: '❌ Upload failed. Please try again.',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    switch (true) {
      case type.includes('pdf'):
        return '📕';
      case type.includes('doc'):
        return '📄';
      case type.includes('txt'):
        return '📝';
      case type.includes('xls'):
        return '📊';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };


    const handlePreview = async () => {
    if (!lastSearchResult) return;
    
    setPreviewLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/file/${lastSearchResult.file_id}/preview`);
      const data = await response.json();
      setPreviewContent(data.preview || 'No content available');
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewContent('Error loading preview');
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white overflow-hidden"
      style={{ backgroundColor: '#0D1F23' }}
    >
      {/* Subtle background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full filter blur-3xl opacity-10"
          style={{ backgroundColor: '#2D4A53' }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full filter blur-3xl opacity-10"
          style={{ backgroundColor: '#2D4A53' }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div 
          className="border-b p-6 shadow-lg"
          style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#2D4A53' }}
            >
              <Sparkles size={24} style={{ color: '#AFB3B7' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#AFB3B7' }}>
                SeerVault
              </h1>
              <p className="text-sm" style={{ color: '#69818D' }}>
                Semantic AI-powered file discovery
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Left Panel - Chat */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">🔍</div>
                    <p className="text-2xl font-bold mb-2" style={{ color: '#AFB3B7' }}>
                      Welcome to SeerVault
                    </p>
                    <p style={{ color: '#69818D' }}>
                      Upload files and search using natural language
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-sm px-4 py-3 rounded-xl shadow-lg ${
                        msg.role === 'user'
                          ? ''
                          : 'border'
                      }`}
                      style={{
                        backgroundColor: msg.role === 'user' ? '#2D4A53' : '#132E35',
                        borderColor: msg.role === 'user' ? '#2D4A53' : '#2D4A53',
                        color: '#AFB3B7',
                      }}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Search Result Display */}
            {lastSearchResult && (
              <div 
                className="mb-6 p-4 rounded-xl border shadow-lg"
                style={{ 
                  backgroundColor: '#132E35',
                  borderColor: '#2D4A53'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl mt-1">{getFileIcon(lastSearchResult.file_type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#AFB3B7' }}>
                        {lastSearchResult.filename}
                    </h3>
                    <button
                        onClick={handlePreview}
                        disabled={previewLoading}
                        className="px-3 py-1 rounded text-sm"
                        style={{ 
                        backgroundColor: '#2D4A53',
                        color: '#AFB3B7'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
                    >
                        {previewLoading ? 'Loading...' : 'Preview'}
                    </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2" style={{ color: '#69818D' }}>
                        <File size={16} />
                        {lastSearchResult.file_type}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: '#69818D' }}>
                        <HardDrive size={16} />
                        {formatFileSize(lastSearchResult.size)}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: '#69818D' }}>
                        <span>⭐</span>
                        <span>{Math.round(lastSearchResult.relevance_score * 100)}% match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div 
              className="rounded-xl border p-4 shadow-lg"
              style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
            >
              <div className="flex gap-3">
                <label 
                  className="p-3 rounded-lg transition cursor-pointer border"
                  style={{ 
                    backgroundColor: '#2D4A53',
                    borderColor: '#2D4A53',
                    color: '#AFB3B7'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
                >
                  <Upload size={20} />
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
                  placeholder="Search your files with AI..."
                  disabled={uploading}
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: '#0D1F23',
                    borderColor: '#2D4A53',
                    color: '#AFB3B7',
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={uploading}
                  className="p-3 rounded-lg transition shadow-lg"
                  style={{
                    backgroundColor: '#2D4A53',
                    color: '#AFB3B7',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
        {/* Preview Modal */}
{previewOpen && (
  <div 
    className="fixed inset-0 flex items-center justify-center p-4 z-50"
    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
  >
    <div 
      className="rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
      style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold" style={{ color: '#AFB3B7' }}>
          {lastSearchResult?.filename}
        </h3>
        <button
          onClick={() => setPreviewOpen(false)}
          className="text-2xl"
          style={{ color: '#69818D' }}
        >
          ✕
        </button>
      </div>
      <div 
        className="text-sm whitespace-pre-wrap p-4 rounded"
        style={{ 
          backgroundColor: '#0D1F23',
          color: '#AFB3B7',
          fontFamily: 'monospace'
        }}
      >
        {previewContent}
      </div>
      <button
        onClick={() => setPreviewOpen(false)}
        className="mt-4 px-4 py-2 rounded w-full"
        style={{ 
          backgroundColor: '#2D4A53',
          color: '#AFB3B7'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
      >
        Close
      </button>
    </div>
  </div>
)}
          </div>

          {/* Right Panel - File Explorer */}
          <div className="w-80 flex flex-col">
            <div 
              className="rounded-xl border overflow-hidden shadow-xl flex flex-col h-full"
              style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
            >
              {/* Explorer Header */}
              <div 
                className="border-b p-4"
                style={{ backgroundColor: '#0D1F23', borderColor: '#2D4A53' }}
              >
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#AFB3B7' }}>
                  <File size={20} />
                  Files ({uploadedFiles.length})
                </h2>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {uploadedFiles.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-sm" style={{ color: '#69818D' }}>
                      No files uploaded yet.<br />Start by uploading documents.
                    </p>
                  </div>
                ) : (
                  uploadedFiles.map((file) => (
                    <div
                      key={file.file_id}
                      className="group p-3 rounded-lg border transition cursor-pointer"
                      style={{ 
                        backgroundColor: '#0D1F23',
                        borderColor: '#2D4A53'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#132E35';
                        e.currentTarget.style.borderColor = '#69818D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0D1F23';
                        e.currentTarget.style.borderColor = '#2D4A53';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl mt-1">{getFileIcon(file.file_type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#AFB3B7' }}>
                            {file.filename}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#69818D' }}>
                            <HardDrive size={12} />
                            {formatFileSize(file.size)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#69818D' }}>
                            <Clock size={12} />
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          className="opacity-0 group-hover:opacity-100 transition p-1 rounded"
                          style={{ color: '#69818D' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Explorer Footer */}
              <div 
                className="border-t p-3 text-xs"
                style={{ backgroundColor: '#0D1F23', borderColor: '#2D4A53', color: '#69818D' }}
              >
                <div className="flex justify-between">
                  <span>{uploadedFiles.length} items</span>
                  <span>Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
