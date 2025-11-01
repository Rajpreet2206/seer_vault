import React, { useState, useRef, useEffect } from 'react';
import { File, ChevronDown, Trash2, HardDrive, Clock, Database } from 'lucide-react';

interface UploadedFile {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

interface CRMData {
  status: string;
  indexed_documents: number;
  last_sync: string;
}

interface DataDropdownProps {
  uploadedFiles: UploadedFile[];
  crmData: CRMData | null;
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
  onSyncCRM: () => void;
  syncing: boolean;
}

export const DataDropdown: React.FC<DataDropdownProps> = ({
  uploadedFiles,
  crmData,
  getFileIcon,
  formatFileSize,
  onSyncCRM,
  syncing,
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

      const dropdownWidth = 400;
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

  const totalCount = (uploadedFiles.length || 0) + (crmData?.indexed_documents || 0);

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
        Data ({totalCount})
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
          className="fixed rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto"
          style={{
            backgroundColor: '#132E35',
            borderColor: '#2D4A53',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: '400px',
            maxWidth: 'calc(100vw - 40px)',
          }}
        >
          <div className="p-4">
            {/* CRM Data Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2" style={{ color: '#AFB3B7' }}>
                  <Database size={16} />
                  CRM Data
                </h3>
                <button
                  onClick={onSyncCRM}
                  disabled={syncing}
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: '#2D4A53',
                    color: '#AFB3B7',
                    opacity: syncing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!syncing) e.currentTarget.style.backgroundColor = '#3D5A63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2D4A53';
                  }}
                >
                  {syncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
              
              {crmData ? (
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: '#0D1F23',
                    borderColor: '#2D4A53',
                  }}
                >
                  <div className="space-y-2 text-sm" style={{ color: '#69818D' }}>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span style={{ color: crmData.status === 'healthy' ? '#69818D' : '#ff6b6b' }}>
                        {crmData.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Records:</span>
                      <span>{crmData.indexed_documents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span>{crmData.last_sync === 'never' ? 'Never' : 'Today'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#69818D' }} className="text-sm">
                  No CRM data connected
                </p>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderBottom: '1px solid #2D4A53', margin: '1rem 0' }}></div>

            {/* Files Section */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#AFB3B7' }}>
                Uploaded Files ({uploadedFiles.length})
              </h3>
              
              {uploadedFiles.length === 0 ? (
                <p className="text-sm" style={{ color: '#69818D' }}>
                  No files uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
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
          </div>
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
