import React from 'react';
import { useEffect, useState } from 'react';

interface EnvironmentInfoProps {
  className?: string;
}

const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({ className = '' }) => {
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiVersion, setApiVersion] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('unknown');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [databaseStatus, setDatabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Determine if we're running in production (Vercel) or development
  const isProduction = window.location.hostname.includes('vercel.app') || 
                      !window.location.hostname.includes('localhost');
  
  // Set the API base URL based on the environment
  const apiBase = isProduction 
    ? '/api' 
    : 'http://localhost:5000/api';

  useEffect(() => {
    async function checkApiHealth() {
      try {
        // Try to fetch the API health endpoint
        const healthUrl = `${apiBase}/health`;
        setApiEndpoint(healthUrl);
        
        const response = await fetch(healthUrl);
        const data = await response.json();
        
        setApiHealth(response.ok ? 'online' : 'offline');
        setEnvironment(data.environment || 'unknown');
        setApiVersion(data.version || 'n/a');
        
        // Check if a database test endpoint exists
        try {
          const dbTestUrl = isProduction ? `${apiBase}/test` : `${apiBase}/health`;
          const dbResponse = await fetch(dbTestUrl);
          const dbData = await dbResponse.json();
          
          // Set database status based on the response
          setDatabaseStatus(
            dbData.database === 'configured' || dbData.status === 'OK' 
              ? 'connected' 
              : 'disconnected'
          );
        } catch (error) {
          setDatabaseStatus('disconnected');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiHealth('offline');
        setDatabaseStatus('disconnected');
      }
    }

    checkApiHealth();
  }, [apiBase, isProduction]);

  // Style based on environment
  const getBgColor = () => {
    if (isProduction) return 'bg-purple-100 border-purple-300';
    return 'bg-green-100 border-green-300';
  };

  const getApiStatusColor = () => {
    if (apiHealth === 'online') return 'text-green-600';
    if (apiHealth === 'offline') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getDatabaseStatusColor = () => {
    if (databaseStatus === 'connected') return 'text-green-600';
    if (databaseStatus === 'disconnected') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className={`${className} ${getBgColor()} border rounded-md p-2 text-xs`}>
      <div className="font-bold mb-1">
        {isProduction ? '🚀 Production (Vercel)' : '🛠️ Development (Local)'}
      </div>
      <div className="flex flex-col gap-1">
        <div>
          API: <span className={getApiStatusColor()}>
            {apiHealth === 'checking' ? 'Checking...' : apiHealth}
          </span>
        </div>
        <div>
          Database: <span className={getDatabaseStatusColor()}>
            {databaseStatus === 'checking' ? 'Checking...' : databaseStatus}
          </span>
        </div>
        <div>Environment: {environment}</div>
        {apiVersion && <div>Version: {apiVersion}</div>}
        <div className="text-gray-500 truncate" title={apiEndpoint}>
          Endpoint: {apiEndpoint}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentInfo;
