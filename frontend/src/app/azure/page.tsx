'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Chart from "chart.js/auto";
import Image from "next/image";

type CostItem = {
  service: string;
  amount: number;
  unit: string;
};

type ResourceItem = {
  id: string;
  type: string;
  region: string;
  status: string;
  cost: number;
};

export default function AzurePage() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const firstDayStr = `${yyyy}-${mm}-01`;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(firstDayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstanceRef = useRef<Chart | null>(null);

  // Mock data for demonstration
  const mockResources: ResourceItem[] = [
    { id: "vm-prod-01", type: "Virtual Machine", region: "East US", status: "running", cost: 89.45 },
    { id: "storage-account-01", type: "Storage Account", region: "East US", status: "active", cost: 34.67 },
    { id: "sql-db-prod", type: "SQL Database", region: "West US 2", status: "online", cost: 156.78 },
    { id: "app-service-web", type: "App Service", region: "East US", status: "running", cost: 67.23 },
  ];

  const azureRegions = [
    { value: "all", label: "All Regions" },
    { value: "eastus", label: "East US" },
    { value: "westus2", label: "West US 2" },
    { value: "westeurope", label: "West Europe" },
    { value: "southeastasia", label: "Southeast Asia" },
  ];

  const handleFetch = () => {
    setLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { service: "Virtual Machines", amount: 312.45, unit: "USD" },
        { service: "Storage Accounts", amount: 89.67, unit: "USD" },
        { service: "SQL Database", amount: 234.12, unit: "USD" },
        { service: "App Service", amount: 156.78, unit: "USD" },
        { service: "Azure Functions", amount: 45.23, unit: "USD" },
      ];
      setData(mockData);
      setLoading(false);
    }, 2000);
  };

  // Calculate metrics
  const totalCost = Array.isArray(data) ? data.reduce((sum, item) => sum + item.amount, 0) : 0;
  const previousMonthCost = totalCost * 0.88; // Mock previous month data
  const costChange = ((totalCost - previousMonthCost) / previousMonthCost) * 100;
  const topServices = data.slice(0, 5);

  // Initialize charts
  useEffect(() => {
    if (chartRef.current && activeTab === "overview" && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      // Generate mock trend data
      const trendData = Array.from({ length: 30 }, (_, i) => {
        const baseValue = totalCost / 30;
        return baseValue + (Math.random() - 0.5) * baseValue * 0.3;
      });
      
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "Daily Cost ($)",
              data: trendData,
              borderColor: "#0078D4",
              backgroundColor: "rgba(0, 120, 212, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 2,
              pointBackgroundColor: "#0078D4",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { 
              grid: { display: false },
              ticks: { display: false }
            },
            y: { 
              grid: { color: "#f3f4f6" }, 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            },
          },
        },
      });
    }

    if (pieChartRef.current && activeTab === "overview" && data.length > 0) {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
      }
      
      pieChartInstanceRef.current = new Chart(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels: topServices.map(item => item.service),
          datasets: [
            {
              data: topServices.map(item => item.amount),
              backgroundColor: [
                "#0078D4",
                "#00BCF2",
                "#40E0D0",
                "#008080",
                "#5F9EA0",
              ],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                padding: 20,
                usePointStyle: true,
              }
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
        pieChartInstanceRef.current = null;
      }
    };
  }, [activeTab, data, totalCost, topServices]);

  const getServiceIcon = (service: string) => {
    const icons: { [key: string]: string } = {
      'Virtual Machine': '🖥️',
      'Storage Account': '🪣',
      'SQL Database': '🗄️',
      'App Service': '🌐',
      'Azure Functions': '⚡',
      'Cosmos DB': '🌍',
      'Service Bus': '🚌',
      'Key Vault': '🔐',
      'Application Gateway': '🚪',
      'Load Balancer': '⚖️',
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (service.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '☁️';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
      case 'online':
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'stopped':
      case 'inactive':
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'creating':
      case 'updating':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/window.svg" alt="Azure" width={48} height={48} />
            <div>
              <h1 className="text-3xl font-bold text-cyan-700">Microsoft Azure Dashboard</h1>
              <p className="text-gray-600">Track your Azure consumption and optimize spending</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="border border-cyan-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {azureRegions.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
            <Button
              onClick={handleFetch}
              disabled={loading || !subscriptionId}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Configuration Section */}
        <Card className="p-6 bg-gradient-to-r from-cyan-50 to-white border-l-4 border-l-cyan-400">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subscription-id" className="block text-sm font-medium text-cyan-700 mb-2">
                Azure Subscription ID *
              </label>
              <input
                id="subscription-id"
                type="text"
                value={subscriptionId}
                onChange={e => setSubscriptionId(e.target.value)}
                placeholder="12345678-1234-1234-1234-123456789012"
                className="w-full border border-cyan-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  max={endDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  min={startDate}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Total Cost</p>
                <p className="text-2xl font-bold text-cyan-700">${totalCost.toFixed(2)}</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${costChange >= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {costChange >= 0 ? '↗' : '↘'} {Math.abs(costChange).toFixed(1)}% vs last month
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Resources</p>
                <p className="text-2xl font-bold text-blue-700">{mockResources.length}</p>
              </div>
              <span className="text-3xl">🖥️</span>
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600">Across {azureRegions.length - 1} regions</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Top Service</p>
                <p className="text-2xl font-bold text-indigo-700">{topServices[0]?.service || 'N/A'}</p>
              </div>
              <span className="text-3xl">{getServiceIcon(topServices[0]?.service || '')}</span>
            </div>
            <div className="mt-2">
              <span className="text-xs text-indigo-600">${topServices[0]?.amount.toFixed(2) || '0.00'} this period</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Daily Cost</p>
                <p className="text-2xl font-bold text-purple-700">${(totalCost / 30).toFixed(2)}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
            <div className="mt-2">
              <span className="text-xs text-purple-600">Based on 30-day period</span>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cost Trend Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Trend (30 Days)</h3>
                {data.length > 0 ? (
                  <canvas ref={chartRef} height={200} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📈</span>
                      <p>Configure Azure integration to view cost trends</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Service Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
                {data.length > 0 ? (
                  <canvas ref={pieChartRef} height={200} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🥧</span>
                      <p>Service breakdown will appear here</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💡</span>
                    <span className="font-medium text-cyan-700">Cost Optimization</span>
                  </div>
                  <p className="text-sm text-gray-600">Consider Azure Reserved Instances for consistent VM workloads</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium text-blue-700">Usage Alert</span>
                  </div>
                  <p className="text-sm text-gray-600">Storage costs increased by 25% this month</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">✅</span>
                    <span className="font-medium text-indigo-700">Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-600">Enable auto-shutdown for development VMs</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Service Breakdown</h3>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-800 text-sm">{error}</div>
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <svg className="animate-spin h-8 w-8 text-cyan-600 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-gray-600">Loading Azure cost data...</span>
                </div>
              ) : data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cyan-50 border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-cyan-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getServiceIcon(item.service)}</span>
                              <span className="font-medium text-gray-800">{item.service}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-cyan-700">${item.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-600">{item.unit}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-cyan-500 h-2 rounded-full" 
                                  style={{ width: `${(item.amount / totalCost) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{((item.amount / totalCost) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image src="/window.svg" alt="Azure" width={64} height={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Azure Data Available</h3>
                  <p className="text-gray-600 mb-4">Configure your Azure Subscription ID above and click "Refresh Data" to view your cost breakdown.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Active Resources</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Region:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  >
                    {azureRegions.map(region => (
                      <option key={region.value} value={region.value}>{region.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Resource ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Region</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Monthly Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResources
                      .filter(resource => selectedRegion === 'all' || resource.region.toLowerCase().replace(/\s+/g, '') === selectedRegion)
                      .map((resource, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{resource.id}</code>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getServiceIcon(resource.type)}</span>
                            <span className="font-medium">{resource.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{resource.region}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-cyan-700">${resource.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mockResources.filter(resource => selectedRegion === 'all' || resource.region.toLowerCase().replace(/\s+/g, '') === selectedRegion).length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p className="text-gray-600">No resources found in the selected region.</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}