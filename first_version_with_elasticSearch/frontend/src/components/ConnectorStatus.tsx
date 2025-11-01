import React, { useState, useEffect } from 'react';
import { RefreshCw, Database } from 'lucide-react';

interface ConnectorStatusData {
  status: string;
  indexed_documents: number;
  last_sync: string;
  index: string;
}

export const ConnectorStatus: React.FC = () => {
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatusData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    fetchConnectorStatus();
  }, []);

  const fetchConnectorStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/connector/status');
      const data = await response.json();
      setConnectorStatus(data);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching connector status:', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://localhost:8000/connector/sync', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('Sync result:', data);
      await fetchConnectorStatus();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (!connectorStatus) return null;

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: '#132E35',
        borderColor: '#2D4A53',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" style={{ color: '#AFB3B7' }}>
          <Database size={18} />
          <span className="font-bold">CRM Data Connected</span>
        </div>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="p-2 rounded transition"
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
          <RefreshCw size={16} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between" style={{ color: '#69818D' }}>
          <span>Status:</span>
          <span style={{ color: connectorStatus.status === 'healthy' ? '#69818D' : '#ff6b6b' }}>
            {connectorStatus.status}
          </span>
        </div>
        <div className="flex justify-between" style={{ color: '#69818D' }}>
          <span>Indexed Records:</span>
          <span>{connectorStatus.indexed_documents}</span>
        </div>
        <div className="flex justify-between" style={{ color: '#69818D' }}>
          <span>Last Synced:</span>
          <span>{lastSyncTime}</span>
        </div>
      </div>
    </div>
  );
};
