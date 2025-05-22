import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Server, 
  Database, 
  GitBranch, 
  Globe,
  Clock
} from 'lucide-react';

interface DeploymentStatusProps {
  className?: string;
  showDetailed?: boolean;
}

interface ApiStatus {
  status: string;
  environment: string;
  version?: string;
  timestamp?: string;
  database?: {
    status?: string;
    name?: string;
    host?: string;
    connected?: boolean;
  };
  deployment?: {
    platform?: string;
    region?: string;
    url?: string;
    branch?: string;
    commitSha?: string;
    buildTime?: string;
  };
  apiVersion?: string;
  serverVersion?: string;
  nodeVersion?: string;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Determine if we're running in production (Vercel) or development
  const isProduction = window.location.hostname.includes('vercel.app') || 
                       !window.location.hostname.includes('localhost');
  
  // Set the API base URL based on the environment
  const apiBase = isProduction 
    ? '/api' 
    : 'http://localhost:5000/api';
    
  // Add a timestamp to track component mounting time
  const [mountTime] = useState<string>(new Date().toISOString());
  const [lastChecked, setLastChecked] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        // Use different endpoints based on environment
        const endpoint = isProduction ? `${apiBase}/environment` : `${apiBase}/environment`;
          // Add cache busting parameter to avoid cached responses
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`${endpoint}${cacheBuster}`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
        setError(null);
        setLastChecked(new Date().toISOString());
      } catch (err) {
        console.error('Failed to fetch deployment status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [apiBase, isProduction]);

  if (loading) {
    return <div className={`${className} p-4 bg-gray-100 border border-gray-200 rounded-lg animate-pulse`}>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>;
  }
  if (error) {
    return <div className={`${className} p-4 bg-red-50 border border-red-200 rounded-lg`}>
      <h3 className="text-lg font-medium text-red-800 mb-2">Deployment Status Error</h3>
      <p className="text-red-600">{error}</p>
      <p className="text-red-600 mt-2">API endpoint: {isProduction ? `${apiBase}/environment` : `${apiBase}/environment`}</p>
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    </div>;
  }

  const getBadgeColor = (env: string) => {
    if (env?.toLowerCase().includes('prod')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (env?.toLowerCase().includes('dev')) return 'bg-green-100 text-green-800 border-green-300';
    if (env?.toLowerCase().includes('stag')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  // Format the timestamp for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`${className} p-4 bg-white border rounded-lg shadow-sm`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Deployment Status</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(status?.environment || '')}`}>
          {status?.environment || 'Unknown'} Environment
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">          <div className="text-gray-500 flex items-center">
            <Server className="h-4 w-4 mr-1 inline-block" /> API Status:
          </div>
          <div className="font-medium flex items-center">
            {status?.status === 'OK' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-600">Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-600">{status?.status || 'Offline'}</span>
              </>
            )}
          </div>
          
          <div className="text-gray-500 flex items-center">
            <Database className="h-4 w-4 mr-1 inline-block" /> Database:
          </div>
          <div className="font-medium">
            {status?.database?.connected || status?.status === 'OK' 
              ? <span className="text-green-600">Connected ✓</span> 
              : <span className="text-red-600">Not Connected ✗</span>
            }
            {status?.database?.name && <span className="text-gray-500 text-xs ml-1">({status.database.name})</span>}
          </div>

          <div className="text-gray-500 flex items-center">
            <GitBranch className="h-4 w-4 mr-1 inline-block" /> Node Version:
          </div>
          <div className="font-medium">{status?.nodeVersion || 'Unknown'}</div>
          
          {isProduction && status?.deployment?.platform && (
            <>
              <div className="text-gray-500 flex items-center">
                <Globe className="h-4 w-4 mr-1 inline-block" /> Platform:
              </div>
              <div className="font-medium">{status.deployment.platform}</div>
            </>
          )}
          
          {isProduction && status?.deployment?.region && (
            <>
              <div className="text-gray-500">Region:</div>
              <div className="font-medium">{status.deployment.region}</div>
            </>
          )}
            {status?.version && (
            <>
              <div className="text-gray-500">API Version:</div>
              <div className="font-medium">{status.version}</div>
            </>
          )}
          
          {status?.timestamp && (
            <>
              <div className="text-gray-500">Last Updated:</div>
              <div className="font-medium text-xs">
                {new Date(status.timestamp).toLocaleString()}
              </div>
            </>
          )}        </div>
      </div>
      
      {/* Add a footer with timestamps and a refresh button */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <div>
          <div>Component mounted: {formatDate(mountTime)}</div>
          <div>Last checked: {formatDate(lastChecked)}</div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        >
          <Clock className="h-3 w-3 mr-1 inline-block" /> Refresh
        </button>
      </div>
    </div>
  );
};

export default DeploymentStatus;
