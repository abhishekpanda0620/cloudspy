"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useCallback } from "react";

export default function HomePage() {
  // Integration button states
  const [testStatus, setTestStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});

  // Simulate test connection
  const handleTestConnection = useCallback((provider: string) => {
    setTestStatus(prev => ({ ...prev, [provider]: 'loading' }));
    setTimeout(() => {
      // Simulate random success/failure
      const isSuccess = Math.random() > 0.3;
      setTestStatus(prev => ({ ...prev, [provider]: isSuccess ? 'success' : 'error' }));
    }, 1200);
  }, []);
  const [activeTab, setActiveTab] = useState("dashboard");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["Jun 1", "Jun 7", "Jun 14", "Jun 21", "Jun 28", "Jul 1"],
          datasets: [
            {
              label: "Total Cloud Cost ($)",
              data: [120, 150, 130, 170, 160, 180],
              borderColor: "#f59e42",
              backgroundColor: "rgba(245, 158, 66, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: "#f59e42",
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
          },
        },
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-blue-50 flex flex-col items-center justify-center">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto mt-8">
        <TabsList className="flex gap-4 justify-center mb-8">
          <TabsTrigger value="dashboard" className="px-6 py-2 text-lg font-bold">Dashboard</TabsTrigger>
          <TabsTrigger value="integration" className="px-6 py-2 text-lg font-bold">Integration</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          {/* ...existing hero, chart, dashboard links, and footer... */}
          <section className="w-full py-16 px-4 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Image src="/globe.svg" alt="CloudSpy" width={72} height={72} className="drop-shadow-lg" />
              <h1 className="text-5xl font-extrabold text-amber-700 tracking-tight mb-2 animate-fade-in">CloudSpy</h1>
              <p className="text-xl text-gray-700 max-w-2xl animate-fade-in-slow">
                <span className="font-semibold text-amber-600">Visualize</span>, <span className="font-semibold text-blue-600">track</span>, and <span className="font-semibold text-green-600">optimize</span> your cloud costs across <span className="font-bold">AWS</span>, <span className="font-bold">GCP</span>, and <span className="font-bold">Azure</span>.<br />Secure, unified, and cloud-agnostic.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center mt-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">💸</span>
                <span className="text-base text-gray-600">Cost Insights</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🔒</span>
                <span className="text-base text-gray-600">Enterprise Security</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">⚡</span>
                <span className="text-base text-gray-600">Fast & Actionable UI</span>
              </div>
            </div>
          </section>
          <Card className="w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl border border-gray-100 mb-12 hover:scale-[1.02] transition-transform duration-300 bg-white/90">
            <h2 className="text-2xl font-bold text-amber-700 mb-4">Cloud Cost Trend</h2>
            <canvas ref={chartRef} height={220} />
          </Card>
          <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
            <Link href="/aws">
              <Card className="flex flex-col items-center gap-3 py-8 px-4 hover:shadow-xl hover:border-amber-400 transition cursor-pointer group">
                <span className="text-4xl group-hover:scale-110 transition">🟧</span>
                <span className="font-bold text-amber-700 text-lg group-hover:underline">AWS Dashboard</span>
                <span className="text-xs text-gray-500">View costs, resources, and trends</span>
              </Card>
            </Link>
            <Link href="/gcp">
              <Card className="flex flex-col items-center gap-3 py-8 px-4 hover:shadow-xl hover:border-blue-400 transition cursor-pointer group">
                <Image src="/globe.svg" alt="GCP" width={40} height={40} className="group-hover:scale-110 transition" />
                <span className="font-bold text-blue-700 text-lg group-hover:underline">GCP Dashboard</span>
                <span className="text-xs text-gray-500">Unified GCP billing & usage</span>
              </Card>
            </Link>
            <Link href="/azure">
              <Card className="flex flex-col items-center gap-3 py-8 px-4 hover:shadow-xl hover:border-blue-500 transition cursor-pointer group">
                <Image src="/window.svg" alt="Azure" width={40} height={40} className="group-hover:scale-110 transition" />
                <span className="font-bold text-blue-500 text-lg group-hover:underline">Azure Dashboard</span>
                <span className="text-xs text-gray-500">Azure cost & resource analytics</span>
              </Card>
            </Link>
          </section>
          <footer className="text-xs text-gray-400 text-center py-6 mt-8">
            <span>
              🔐 Privacy first &nbsp;|&nbsp; 🌐 Cloud-agnostic &nbsp;|&nbsp; ⚡ Fast, clean, actionable UI
            </span>
          </footer>
        </TabsContent>
        <TabsContent value="integration">
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* AWS Integration */}
            <Card className="flex flex-col gap-6 items-center p-8 rounded-2xl shadow-xl border border-amber-100 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">🟧</span>
                <h3 className="font-bold text-amber-700 text-xl">AWS</h3>
              </div>
              <div className="w-full text-left">
                <h4 className="font-semibold text-amber-700 mb-2">Integration Steps</h4>
                <ol className="text-sm text-gray-700 list-decimal list-inside mb-2 space-y-1">
                  <li>Go to <a href="https://console.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">AWS IAM Console</a>.</li>
                  <li>Create a cross-account IAM role for CloudSpy.<br /><span className="text-xs">(Trusted entity: your AWS account, External ID: from CloudSpy)</span></li>
                  <li>Attach <code className="bg-amber-50 px-1 rounded">CostExplorerReadOnlyAccess</code> policy.</li>
                  <li>Copy the Role ARN and paste it in CloudSpy's AWS integration settings.</li>
                  <li>Example ARN: <code className="bg-gray-100 px-1 break-all rounded">arn:aws:iam::123456789012:role/CloudSpyCostRole</code></li>
                </ol>
                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="aws-arn" className="text-sm font-medium text-amber-700">Role ARN</label>
                  <input id="aws-arn" type="text" placeholder="Paste your AWS Role ARN here" className="border border-amber-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  <button className="bg-amber-600 text-white px-4 py-1 rounded mt-2 hover:bg-amber-700 transition text-sm font-semibold">Save</button>
                </div>
              </div>
              <button
                className="bg-amber-700 text-white px-5 py-2 rounded-lg shadow hover:bg-amber-800 transition flex items-center gap-2 text-base font-semibold mt-2"
                onClick={() => handleTestConnection('aws')}
                disabled={testStatus['aws'] === 'loading'}
              >
                {testStatus['aws'] === 'loading' ? (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : null}
                Test Connection
              </button>
              {testStatus['aws'] === 'success' && <span className="text-green-600 text-sm mt-2">Connection successful!</span>}
              {testStatus['aws'] === 'error' && <span className="text-red-600 text-sm mt-2">Connection failed. Check your Role ARN and permissions.</span>}
            </Card>
            {/* GCP Integration */}
            <Card className="flex flex-col gap-6 items-center p-8 rounded-2xl shadow-xl border border-blue-100 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/globe.svg" alt="GCP" width={32} height={32} />
                <h3 className="font-bold text-blue-700 text-xl">GCP</h3>
              </div>
              <div className="w-full text-left">
                <h4 className="font-semibold text-blue-700 mb-2">Integration Steps</h4>
                <ol className="text-sm text-gray-700 list-decimal list-inside mb-2 space-y-1">
                  <li>Go to <a href="https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">GCP Billing API</a> and enable it.</li>
                  <li>Set up OAuth consent and credentials in <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">APIs & Services &gt; Credentials</a>.</li>
                  <li>Paste the OAuth Client ID in CloudSpy's GCP integration settings.</li>
                  <li>Example Client ID: <code className="bg-gray-100 px-1 rounded">1234567890-abcdefg.apps.googleusercontent.com</code></li>
                </ol>
                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="gcp-client-id" className="text-sm font-medium text-blue-700">OAuth Client ID</label>
                  <input id="gcp-client-id" type="text" placeholder="Paste your GCP OAuth Client ID here" className="border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button className="bg-blue-700 text-white px-4 py-1 rounded mt-2 hover:bg-blue-800 transition text-sm font-semibold">Save</button>
                </div>
              </div>
              <button
                className="bg-blue-700 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-800 transition flex items-center gap-2 text-base font-semibold mt-2"
                onClick={() => handleTestConnection('gcp')}
                disabled={testStatus['gcp'] === 'loading'}
              >
                {testStatus['gcp'] === 'loading' ? (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : null}
                Test Connection
              </button>
              {testStatus['gcp'] === 'success' && <span className="text-green-600 text-sm mt-2">Connection successful!</span>}
              {testStatus['gcp'] === 'error' && <span className="text-red-600 text-sm mt-2">Connection failed. Check your Client ID and API access.</span>}
            </Card>
            {/* Azure Integration */}
            <Card className="flex flex-col gap-6 items-center p-8 rounded-2xl shadow-xl border border-blue-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/window.svg" alt="Azure" width={32} height={32} />
                <h3 className="font-bold text-blue-500 text-xl">Azure</h3>
              </div>
              <div className="w-full text-left">
                <h4 className="font-semibold text-blue-500 mb-2">Integration Steps</h4>
                <ol className="text-sm text-gray-700 list-decimal list-inside mb-2 space-y-1">
                  <li>Go to <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Azure Portal</a> and register an app in Azure AD.</li>
                  <li>Grant <code className="bg-blue-50 px-1 rounded">CostManagementReader</code> role to the app.</li>
                  <li>Enter the Client ID and Tenant ID in CloudSpy's Azure integration settings.</li>
                  <li>Example Client ID: <code className="bg-gray-100 px-1 rounded">abcdefg-1234-5678-9101-abcdefabcdef</code></li>
                </ol>
                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="azure-client-id" className="text-sm font-medium text-blue-500">Client ID</label>
                  <input id="azure-client-id" type="text" placeholder="Paste your Azure Client ID here" className="border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <label htmlFor="azure-tenant-id" className="text-sm font-medium text-blue-500 mt-2">Tenant ID</label>
                  <input id="azure-tenant-id" type="text" placeholder="Paste your Azure Tenant ID here" className="border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button className="bg-blue-500 text-white px-4 py-1 rounded mt-2 hover:bg-blue-600 transition text-sm font-semibold">Save</button>
                </div>
              </div>
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-600 transition flex items-center gap-2 text-base font-semibold mt-2"
                onClick={() => handleTestConnection('azure')}
                disabled={testStatus['azure'] === 'loading'}
              >
                {testStatus['azure'] === 'loading' ? (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : null}
                Test Connection
              </button>
              {testStatus['azure'] === 'success' && <span className="text-green-600 text-sm mt-2">Connection successful!</span>}
              {testStatus['azure'] === 'error' && <span className="text-red-600 text-sm mt-2">Connection failed. Check your Client ID and permissions.</span>}
            </Card>
          </div>  
        </TabsContent>
      </Tabs>
    </div>
  );
}
