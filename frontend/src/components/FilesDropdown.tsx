
import React, { useState, useRef, useEffect } from 'react';
import { File, ChevronDown, Trash2, HardDrive, Clock } from 'lucide-react';

interface UploadedFile {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

interface FilesDropdownProps {
  uploadedFiles: UploadedFile[];
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
}

export const FilesDropdown: React.FC<FilesDropdownProps> = ({
  uploadedFiles,
  getFileIcon,
  formatFileSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: '0px', left: '0px' });

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let top = buttonRect.bottom + 10;
      let left = buttonRect.left;

      if (top + dropdownHeight > windowHeight) {
        top = buttonRect.top - dropdownHeight - 10;
      }

      const dropdownWidth = 384;
      if (left + dropdownWidth > windowWidth) {
        left = windowWidth - dropdownWidth - 20;
      }

      if (left < 20) {
        left = 20;
      }

      setDropdownStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
        style={{
          backgroundColor: '#2D4A53',
          color: '#AFB3B7',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3D5A63'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D4A53'}
      >
        <File size={18} />
        Files ({uploadedFiles.length})
        <ChevronDown 
          size={18} 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed rounded-xl shadow-2xl border z-50 max-h-80 overflow-y-auto"
          style={{
            backgroundColor: '#132E35',
            borderColor: '#2D4A53',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: '384px',
            maxWidth: 'calc(100vw - 40px)',
          }}
        >
          {uploadedFiles.length === 0 ? (
            <div className="p-4 text-center" style={{ color: '#69818D' }}>
              <p className="text-sm">No files uploaded yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.file_id}
                  className="p-3 rounded-lg border transition group"
                  style={{
                    backgroundColor: '#0D1F23',
                    borderColor: '#2D4A53',
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
                    <div className="text-2xl flex-shrink-0">{getFileIcon(file.file_type)}</div>
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
                      className="opacity-0 group-hover:opacity-100 transition p-1 flex-shrink-0"
                      style={{ color: '#69818D' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
