
import React from 'react';
import { FileText, FileJson, File } from 'lucide-react';

interface Result {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  relevance_score: number;
}

interface SearchResultProps {
  result: Result | null;
  query: string;
}

export const SearchResult: React.FC<SearchResultProps> = ({ result, query }) => {
  if (!result) {
    return (
      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
        <p className="text-orange-800">No files found for "{query}"</p>
      </div>
    );
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case '.pdf':
        return <FileText size={24} className="text-red-500" />;
      case '.docx':
        return <File size={24} className="text-blue-500" />;
      case '.txt':
        return <FileJson size={24} className="text-gray-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {getFileIcon(result.file_type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {result.filename}
          </h3>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <span>📄 Type: {result.file_type}</span>
            <span>💾 Size: {formatFileSize(result.size)}</span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              Relevance: {(result.relevance_score * 10).toFixed(0)}%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            ID: {result.file_id}
          </p>
        </div>
      </div>
    </div>
  );
};
