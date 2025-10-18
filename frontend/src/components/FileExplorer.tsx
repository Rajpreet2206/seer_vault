import React, { useState } from 'react';
import { File, Trash2, Clock, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';

interface UploadedFile {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

interface FileExplorerProps {
  uploadedFiles: UploadedFile[];
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  uploadedFiles,
  getFileIcon,
  formatFileSize,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-80 flex flex-col">
      <div 
        className="rounded-xl border overflow-hidden shadow-xl flex flex-col h-full"
        style={{ backgroundColor: '#132E35', borderColor: '#2D4A53' }}
      >
        {/* Explorer Header - Collapsable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border-b p-4 flex items-center justify-between transition"
          style={{ backgroundColor: '#0D1F23', borderColor: '#2D4A53' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#132E35';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0D1F23';
          }}
        >
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#AFB3B7' }}>
            <File size={20} />
            Files ({uploadedFiles.length})
          </h2>
          <div style={{ color: '#69818D' }}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {/* File List - Collapsable */}
        {isOpen && (
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
        )}

        {/* Explorer Footer */}
        <div 
          className="border-t p-3 text-xs"
          style={{ backgroundColor: '#0D1F23', borderColor: '#2D4A53', color: '#69818D' }}
        >
          <div className="flex justify-between">
            <span>{uploadedFiles.length} items</span>
            <span>{isOpen ? 'Open' : 'Closed'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
