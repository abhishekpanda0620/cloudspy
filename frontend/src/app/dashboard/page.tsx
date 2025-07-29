'use client';

import { useState } from 'react';
import { fetchDashboardSummary } from '../../../lib/api';
import DashboardLayout from '../DashboardLayout';
import { Card } from "@/components/ui/card";

interface DashboardData {
  total_cost: number;
  cost_by_provider: Record<string, number>;
  cost_by_service: Array<{
    service: string;
    amount: number;
    unit: string;
  }>;
  period: string;
  last_updated: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration state
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-29');
  const [awsRoleArn, setAwsRoleArn] = useState('');
  const [azureSubscriptionId, setAzureSubscriptionId] = useState('');
  const [azureTenantId, setAzureTenantId] = useState('');
  const [azureClientId, setAzureClientId] = useState('');
  const [azureClientSecret, setAzureClientSecret] = useState('');
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpServiceAccountKey, setGcpServiceAccountKey] = useState('');

  const handleFetch = () => {
    setLoading(true);
    setError(null);
    
    const params: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
    };

    // Add AWS credentials if provided
    if (awsRoleArn) params.aws_role_arn = awsRoleArn;

    // Add Azure credentials if provided
    if (azureSubscriptionId) params.azure_subscription_id = azureSubscriptionId;
    if (azureTenantId) params.azure_tenant_id = azureTenantId;
    if (azureClientId) params.azure_client_id = azureClientId;
    if (azureClientSecret) params.azure_client_secret = azureClientSecret;

    // Add GCP credentials if provided
    if (gcpProjectId) params.gcp_project_id = gcpProjectId;
    if (gcpServiceAccountKey) params.gcp_service_account_key = gcpServiceAccountKey;

    fetchDashboardSummary(params)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch dashboard data');
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'aws': return 'text-orange-600 bg-orange-50';
      case 'azure': return 'text-blue-600 bg-blue-50';
      case 'gcp': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'aws': return '☁️';
      case 'azure': return '🔷';
      case 'gcp': return '🌐';
      default: return '☁️';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Cloud Dashboard</h1>
          <div className="text-sm text-gray-500">
            Unified cost monitoring across all providers
          </div>
        </div>

        {/* Configuration Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Configuration</h2>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* AWS Configuration */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">☁️ AWS Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IAM Role ARN (Optional)
              </label>
              <input
                type="text"
                value={awsRoleArn}
                onChange={(e) => setAwsRoleArn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="arn:aws:iam::123456789012:role/CostExplorerRole"
              />
            </div>
          </div>

          {/* Azure Configuration */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">🔷 Azure Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription ID (Optional)
                </label>
                <input
                  type="text"
                  value={azureSubscriptionId}
                  onChange={(e) => setAzureSubscriptionId(e.target.value)}
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
                  value={azureTenantId}
                  onChange={(e) => setAzureTenantId(e.target.value)}
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
                  value={azureClientId}
                  onChange={(e) => setAzureClientId(e.target.value)}
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
                  value={azureClientSecret}
                  onChange={(e) => setAzureClientSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Client secret value"
                />
              </div>
            </div>
          </div>

          {/* GCP Configuration */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">🌐 Google Cloud Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID (Optional)
                </label>
                <input
                  type="text"
                  value={gcpProjectId}
                  onChange={(e) => setGcpProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="my-gcp-project-id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Account Key (Optional)
                </label>
                <textarea
                  value={gcpServiceAccountKey}
                  onChange={(e) => setGcpServiceAccountKey(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder='{"type": "service_account", ...}'
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Generate Dashboard'}
          </button>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </Card>
        )}

        {/* Dashboard Results */}
        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Cost</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${data.total_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </Card>

              {Object.entries(data.cost_by_provider).map(([provider, cost]) => (
                <Card key={provider} className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {provider} Cost
                      </p>
                      <p className={`text-2xl font-bold ${getProviderColor(provider).split(' ')[0]}`}>
                        ${cost.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-3xl">{getProviderIcon(provider)}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Cost by Provider Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cost by Provider</h2>
              <div className="space-y-3">
                {Object.entries(data.cost_by_provider).map(([provider, cost]) => {
                  const percentage = data.total_cost > 0 ? (cost / data.total_cost) * 100 : 0;
                  return (
                    <div key={provider} className="flex items-center">
                      <div className="w-20 text-sm font-medium capitalize">
                        {getProviderIcon(provider)} {provider}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${getProviderColor(provider).split(' ')[1]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-sm font-medium">${cost.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top Services */}
            {data.cost_by_service.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Top Services by Cost</h2>
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
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.cost_by_service.slice(0, 10).map((service, index) => {
                        const percentage = data.total_cost > 0 ? (service.amount / data.total_cost) * 100 : 0;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {service.service}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              ${service.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card className="p-4 bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Period: {data.period}</span>
                <span>Last Updated: {new Date(data.last_updated).toLocaleString()}</span>
              </div>
            </Card>
          </>
        )}

        {!loading && !error && !data && (
          <Card className="p-6 text-center text-gray-500">
            <p>Configure your cloud provider credentials and generate a dashboard to get started.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}