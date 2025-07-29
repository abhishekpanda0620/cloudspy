'use client';

import { useState } from 'react';
import { fetchGcpCosts, testGcpConnection } from '../../../lib/api';
import DashboardLayout from '../DashboardLayout';
import { Card } from "@/components/ui/card";

interface GcpCostData {
  service: string;
  amount: number;
  unit: string;
  date?: string;
}

export default function GcpPage() {
  const [data, setData] = useState<GcpCostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  // Form state
  const [projectId, setProjectId] = useState('');
  const [serviceAccountKey, setServiceAccountKey] = useState('');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-29');
  const [granularity, setGranularity] = useState('MONTHLY');

  const handleTestConnection = async () => {
    if (!projectId) {
      setConnectionStatus('Project ID is required');
      return;
    }

    setConnectionStatus('Testing connection...');
    try {
      const result = await testGcpConnection({
        project_id: projectId,
        service_account_key: serviceAccountKey || undefined,
      });
      
      if (result.success) {
        setConnectionStatus('✅ Connection successful!');
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.message}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setConnectionStatus(`❌ Connection failed: ${errorMessage}`);
    }
  };

  const handleFetch = () => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    fetchGcpCosts({ 
      start_date: startDate, 
      end_date: endDate, 
      project_id: projectId,
      service_account_key: serviceAccountKey || undefined,
      granularity: granularity
    })
      .then(res => {
        if (Array.isArray(res)) {
          setData(res);
        } else if (res && res.error) {
          setError(res.error);
          setData([]);
        } else {
          setError('Unexpected response from server');
          setData([]);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch data');
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  const totalCost = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Google Cloud Cost Analysis</h1>
          <div className="text-sm text-gray-500">
            Multi-cloud cost monitoring
          </div>
        </div>

        {/* Configuration Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Google Cloud Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID *
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="my-gcp-project-id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DAILY">Daily</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Account Key JSON (Optional)
            </label>
            <textarea
              value={serviceAccountKey}
              onChange={(e) => setServiceAccountKey(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder='{"type": "service_account", "project_id": "...", ...}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default application credentials (ADC)
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleTestConnection}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Test Connection
            </button>
            <button
              onClick={handleFetch}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch GCP Costs'}
            </button>
          </div>

          {connectionStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{connectionStatus}</p>
            </div>
          )}
        </Card>

        {/* Results */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </Card>
        )}

        {data.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Google Cloud Cost Breakdown</h2>
              <div className="text-2xl font-bold text-green-600">
                Total: ${totalCost.toFixed(2)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    {data.some(item => item.date) && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.service}
                      </td>
                      <td className={`py-3 px-4 font-bold ${item.amount >= 0 ? 'text-green-700' : 'text-blue-700'}`}>
                        {item.amount >= 0 ? '$' : '-$'}{Math.abs(item.amount).toFixed(2)}
                        {item.amount < 0 && <span className="text-xs ml-1">(credit)</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.unit}
                      </td>
                      {item.date && (
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.date}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!loading && !error && data.length === 0 && (
          <Card className="p-6 text-center text-gray-500">
            <p>No GCP cost data available. Configure your credentials and fetch data to get started.</p>
            <div className="mt-4 text-sm">
              <p><strong>Note:</strong> GCP cost data integration is currently in development.</p>
              <p>For full cost analysis, consider using BigQuery export or Cloud Billing API directly.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}