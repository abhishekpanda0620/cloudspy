'use client';

import { useState } from 'react';
import { fetchAzureCosts, testAzureConnection } from '../../../lib/api';
import DashboardLayout from '../DashboardLayout';
import { Card } from "@/components/ui/card";

interface AzureCostData {
  service: string;
  amount: number;
  unit: string;
  date?: string;
}

export default function AzurePage() {
  const [data, setData] = useState<AzureCostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  // Form state
  const [subscriptionId, setSubscriptionId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-29');
  const [granularity, setGranularity] = useState('Monthly');

  const handleTestConnection = async () => {
    if (!subscriptionId) {
      setConnectionStatus('Subscription ID is required');
      return;
    }

    setConnectionStatus('Testing connection...');
    try {
      const result = await testAzureConnection({
        subscription_id: subscriptionId,
        tenant_id: tenantId || undefined,
        client_id: clientId || undefined,
        client_secret: clientSecret || undefined,
      });
      
      if (result.success) {
        setConnectionStatus('✅ Connection successful!');
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.message}`);
      }
    } catch (err: any) {
      setConnectionStatus(`❌ Connection failed: ${err.message}`);
    }
  };

  const handleFetch = () => {
    if (!subscriptionId) {
      setError('Subscription ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    fetchAzureCosts({ 
      start_date: startDate, 
      end_date: endDate, 
      subscription_id: subscriptionId,
      tenant_id: tenantId || undefined,
      client_id: clientId || undefined,
      client_secret: clientSecret || undefined,
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
          <h1 className="text-3xl font-bold text-gray-900">Azure Cost Analysis</h1>
          <div className="text-sm text-gray-500">
            Multi-cloud cost monitoring
          </div>
        </div>

        {/* Configuration Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Azure Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription ID *
              </label>
              <input
                type="text"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant ID (Optional)
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID (Optional)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Application (client) ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret (Optional)
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client secret value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Azure Costs'}
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
              <h2 className="text-xl font-semibold">Azure Cost Breakdown</h2>
              <div className="text-2xl font-bold text-blue-600">
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
                      <td className={`py-3 px-4 font-bold ${item.amount >= 0 ? 'text-blue-700' : 'text-green-700'}`}>
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
            <p>No Azure cost data available. Configure your credentials and fetch data to get started.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}