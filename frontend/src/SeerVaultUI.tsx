import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SearchInput } from './components/SearchInput';
import { FilesDropdown } from './components/FilesDropdown';
import { StagingArea } from './components/StagingArea';

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
          content: data.response,
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
      }
    } catch (error) {
      console.error('Upload error:', error);
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
      className="min-h-screen text-white"
      style={{ backgroundColor: '#0D1F23' }}
    >
      {/* Background accents */}
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
        {/* Header - Rigid */}
        <div 
          className="border-b p-6 shadow-lg flex-shrink-0"
          style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
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

            <FilesDropdown 
              uploadedFiles={uploadedFiles}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Staging Area - Centered */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <StagingArea 
              searchResult={lastSearchResult}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
              onPreview={handlePreview}
              previewLoading={previewLoading}
              hasSearched={messages.length > 0}
            />
          </div>

          {/* Input Area - Rigid Bottom */}
          <div className="flex-shrink-0 border-t p-6" style={{ borderColor: '#2D4A53' }}>
            <SearchInput 
              input={input}
              setInput={setInput}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              uploading={uploading}
            />
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
              style={{ backgroundColor: '#132E35' }}
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
    </div>
  );
}