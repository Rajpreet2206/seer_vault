import React from 'react';

interface SearchResult {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  relevance_score: number;
}

interface StagingAreaProps {
  searchResult: SearchResult | null;
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
  onPreview: () => void;
  previewLoading: boolean;
  hasSearched: boolean;
}

export const StagingArea: React.FC<StagingAreaProps> = ({
  searchResult,
  getFileIcon,
  formatFileSize,
  onPreview,
  previewLoading,
  hasSearched,
}) => {
  if (!hasSearched) {
    return (
      <div className="text-center">
        <div 
          className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8 mx-auto"
          style={{ 
            backgroundColor: '#132E35', 
            border: '3px solid #2D4A53',
            boxShadow: '0 0 30px rgba(45, 74, 83, 0.2)'
          }}
        >
          <span className="text-6xl">📁</span>
        </div>
        {/* <h3 className="text-3xl font-bold mb-3" style={{ color: '#AFB3B7' }}>
          Staging Area
        </h3> */}
        <p style={{ color: '#69818D' }} className="text-lg">
          Search to see your files here
        </p>
      </div>
    );
  }

  if (!searchResult) {
    return (
      <div className="text-center">
        <p style={{ color: '#69818D' }}>No files found</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-7xl mb-4">{getFileIcon(searchResult.file_type)}</div>
      <h2 className="text-xl font-medium" style={{ color: '#AFB3B7' }}>
        {searchResult.filename}
      </h2>
      <button
        onClick={onPreview}
        disabled={previewLoading}
        className="mt-6 px-4 py-2 rounded text-sm"
        style={{
          backgroundColor: '#2D4A53',
          color: '#AFB3B7',
        }}
        onMouseEnter={(e) => {
          if (!previewLoading) {
            e.currentTarget.style.backgroundColor = '#3D5A63';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2D4A53';
        }}
      >
        {previewLoading ? 'Loading...' : 'Preview'}
      </button>
    </div>
  );
};