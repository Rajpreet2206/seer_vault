import React from 'react';
import { Send, Upload, Sparkles } from 'lucide-react';

interface SearchInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  input,
  setInput,
  onSendMessage,
  onFileUpload,
  uploading,
}) => {
  return (
    <div className="w-full">
      {/* Floating label effect */}
      <div 
        className="rounded-2xl p-1 shadow-2xl"
        style={{ backgroundColor: '#0D1F23', border: '2px solid transparent' }}
      >
        <div 
          className="rounded-xl p-4 backdrop-blur-xl"
          style={{ backgroundColor: '#132E35' }}
        >
          {/* Input with icon */}
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <label 
              className="p-3 rounded-xl transition cursor-pointer flex-shrink-0 group"
              style={{ 
                backgroundColor: '#2D4A53',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
            >
              <Upload size={20} style={{ color: '#AFB3B7' }} />
              <input
                type="file"
                multiple
                onChange={onFileUpload}
                disabled={uploading}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />
              {uploading && (
                <span className="absolute text-xs" style={{ color: '#69818D' }}>
                  ...
                </span>
              )}
            </label>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                placeholder="Ask me anything about your files..."
                disabled={uploading}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition text-sm"
                style={{
                  backgroundColor: '#0D1F23',
                  borderColor: '#2D4A53',
                  color: '#AFB3B7',
                  border: '1px solid #2D4A53'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#69818D';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(105, 129, 141, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2D4A53';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {/* Sparkles icon inside input */}
              <Sparkles 
                size={16} 
                className="absolute right-3 top-3"
                style={{ color: '#69818D' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={onSendMessage}
              disabled={uploading || !input.trim()}
              className="p-3 rounded-xl transition flex-shrink-0 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: '#2D4A53',
                color: '#AFB3B7',
                opacity: uploading || !input.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!uploading && input.trim()) {
                  e.currentTarget.style.backgroundColor = '#3D5A63';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2D4A53';
              }}
            >
              <Send size={20} />
            </button>
          </div>

          {/* Hint text */}
          <div className="mt-2 text-xs" style={{ color: '#69818D' }}>
            💡 Tip: Try searching with keywords like "PDF documents", "recent files", or file names
          </div>
        </div>
      </div>
    </div>
  );
};
