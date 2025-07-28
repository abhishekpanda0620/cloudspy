"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [testStatus, setTestStatus] = useState<{
    [key: string]: "idle" | "loading" | "success" | "error";
  }>({});
  const [integrationData, setIntegrationData] = useState({
    aws: {
      roleArn: "",
      externalId: "cloudspy-" + Math.random().toString(36).substr(2, 9),
    },
    gcp: { clientId: "", projectId: "" },
    azure: { clientId: "", tenantId: "", subscriptionId: "" },
  });

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Simulate test connection with more realistic behavior
  const handleTestConnection = useCallback((provider: string) => {
    setTestStatus((prev) => ({ ...prev, [provider]: "loading" }));
    setTimeout(() => {
      const isSuccess = Math.random() > 0.4;
      setTestStatus((prev) => ({
        ...prev,
        [provider]: isSuccess ? "success" : "error",
      }));
    }, 2000);
  }, []);

  const handleInputChange = (
    provider: string,
    field: string,
    value: string
  ) => {
    setIntegrationData((prev) => ({
      ...prev,
      [provider]: { ...prev[provider as keyof typeof prev], [field]: value },
    }));
  };

  const saveIntegration = (provider: string) => {
    // Here you would typically save to backend
    console.log(
      `Saving ${provider} integration:`,
      integrationData[provider as keyof typeof integrationData]
    );
    // Show success message or handle errors
  };

  useEffect(() => {
    if (chartRef.current && activeTab === "dashboard") {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [
            {
              label: "AWS",
              data: [120, 150, 130, 170, 160, 180, 195],
              borderColor: "#FF9900",
              backgroundColor: "rgba(255, 153, 0, 0.1)",
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#FF9900",
            },
            {
              label: "GCP",
              data: [80, 90, 85, 95, 100, 110, 105],
              borderColor: "#4285F4",
              backgroundColor: "rgba(66, 133, 244, 0.1)",
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#4285F4",
            },
            {
              label: "Azure",
              data: [60, 70, 75, 80, 85, 90, 88],
              borderColor: "#0078D4",
              backgroundColor: "rgba(0, 120, 212, 0.1)",
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#0078D4",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top" as const,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              title: { display: true, text: "Month" },
            },
            y: {
              grid: { color: "#f3f4f6" },
              beginAtZero: true,
              title: { display: true, text: "Cost ($)" },
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
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="dashboard" className="text-base font-semibold">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="integration" className="text-base font-semibold">
              Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative">
                  <Image
                    src="/globe.svg"
                    alt="CloudSpy"
                    width={80}
                    height={80}
                    className="drop-shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    Welcome to <span className="text-amber-600">CloudSpy</span>
                  </h1>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Your unified platform for monitoring and optimizing cloud costs across 
                    <span className="font-semibold text-orange-600"> AWS</span>, 
                    <span className="font-semibold text-blue-600"> Google Cloud</span>, and 
                    <span className="font-semibold text-cyan-600"> Azure</span>. 
                    Get actionable insights with enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Cost Optimization</h3>
                <p className="text-sm text-gray-600">Identify waste, track spending trends, and optimize your cloud budget across all providers.</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure Integration</h3>
                <p className="text-sm text-gray-600">Read-only access with industry-standard security practices. Your credentials stay safe.</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Unified Dashboard</h3>
                <p className="text-sm text-gray-600">Single pane of glass for all your cloud resources and costs. No more switching between consoles.</p>
              </Card>
            </div>

            {/* Cost Overview Chart */}
            <Card className="p-8 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Multi-Cloud Cost Overview</h2>
                  <p className="text-gray-600">Track your spending trends across all cloud providers</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>AWS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>GCP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span>Azure</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <canvas ref={chartRef} />
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-orange-700">$2,847</p>
                    <p className="text-xs text-orange-600">+12% from last month</p>
                  </div>
                  <span className="text-3xl">📈</span>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Active Resources</p>
                    <p className="text-2xl font-bold text-blue-700">247</p>
                    <p className="text-xs text-blue-600">Across 3 providers</p>
                  </div>
                  <span className="text-3xl">⚡</span>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-700">$342</p>
                    <p className="text-xs text-green-600">Idle resources found</p>
                  </div>
                  <span className="text-3xl">💡</span>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Alerts</p>
                    <p className="text-2xl font-bold text-purple-700">3</p>
                    <p className="text-xs text-purple-600">Budget thresholds</p>
                  </div>
                  <span className="text-3xl">🚨</span>
                </div>
              </Card>
            </div>

            {/* Cloud Provider Dashboards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Cloud Provider Dashboards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/aws" className="group">
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <span className="text-3xl">🟧</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-700 group-hover:text-orange-800">
                          AWS Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Monitor EC2, S3, RDS costs and usage patterns
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Connected</span>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/gcp" className="group">
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Image src="/globe.svg" alt="GCP" width={32} height={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-700 group-hover:text-blue-800">
                          GCP Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Track Compute Engine, Cloud Storage, and BigQuery costs
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Not Connected</span>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/azure" className="group">
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 hover:border-cyan-300 bg-gradient-to-br from-cyan-50 to-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                        <Image src="/window.svg" alt="Azure" width={32} height={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-cyan-700 group-hover:text-cyan-800">
                          Azure Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Analyze Virtual Machines, Storage, and SQL Database costs
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Not Connected</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Getting Started */}
            <Card className="p-8 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-800 mb-2">Ready to get started?</h3>
                  <p className="text-amber-700 mb-4">
                    Connect your first cloud provider to start monitoring costs and identifying optimization opportunities.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("integration")}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Set Up Integration →
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent> 
         <TabsContent value="integration">
            <div className="w-full max-w-6xl mx-auto space-y-8">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Cloud Provider Integration</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Connect your cloud accounts securely to start monitoring costs and resources. 
                  CloudSpy uses read-only permissions and follows security best practices.
                </p>
              </div>

              {/* Integration Status Overview */}
              <Card className="p-6 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Integration Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                    <span className="text-2xl">🟧</span>
                    <div>
                      <div className="font-medium text-gray-800">AWS</div>
                      <div className="text-sm text-gray-500">
                        {testStatus["aws"] === "success" ? "✅ Connected" : "⚪ Not Connected"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                    <Image src="/globe.svg" alt="GCP" width={24} height={24} />
                    <div>
                      <div className="font-medium text-gray-800">Google Cloud</div>
                      <div className="text-sm text-gray-500">
                        {testStatus["gcp"] === "success" ? "✅ Connected" : "⚪ Not Connected"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                    <Image src="/window.svg" alt="Azure" width={24} height={24} />
                    <div>
                      <div className="font-medium text-gray-800">Microsoft Azure</div>
                      <div className="text-sm text-gray-500">
                        {testStatus["azure"] === "success" ? "✅ Connected" : "⚪ Not Connected"}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AWS Integration */}
              <Card className="p-8 border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🟧</span>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700">Amazon Web Services</h3>
                      <p className="text-gray-600">Connect using IAM Cross-Account Role</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testStatus["aws"] === "success" && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Connected
                      </span>
                    )}
                    {testStatus["aws"] === "error" && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        ❌ Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">📋</span> Setup Instructions
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex gap-3">
                        <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          Open <a href="https://console.aws.amazon.com/iam/home#/roles" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline font-medium">AWS IAM Console → Roles</a>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          Create role → "Another AWS account" → Account ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">123456789012</code>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          External ID: <code className="bg-orange-50 px-2 py-1 rounded text-xs font-mono">{integrationData.aws.externalId}</code>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          Attach policies: <code className="bg-gray-100 px-2 py-1 rounded text-xs">CostExplorerReadOnlyAccess</code>, <code className="bg-gray-100 px-2 py-1 rounded text-xs">ViewOnlyAccess</code>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                        <div>Copy the Role ARN and paste it below</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="aws-arn" className="block text-sm font-medium text-orange-700 mb-2">
                        AWS Role ARN *
                      </label>
                      <input
                        id="aws-arn"
                        type="text"
                        value={integrationData.aws.roleArn}
                        onChange={(e) => handleInputChange("aws", "roleArn", e.target.value)}
                        placeholder="arn:aws:iam::123456789012:role/CloudSpyCostRole"
                        className="w-full border border-orange-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-xs text-orange-700 font-medium mb-1">External ID (Auto-generated)</div>
                      <code className="text-xs bg-white px-2 py-1 rounded border">{integrationData.aws.externalId}</code>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => saveIntegration("aws")}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={!integrationData.aws.roleArn}
                      >
                        Save Configuration
                      </Button>
                      <Button
                        onClick={() => handleTestConnection("aws")}
                        disabled={testStatus["aws"] === "loading" || !integrationData.aws.roleArn}
                        className="flex-1 bg-orange-700 hover:bg-orange-800 text-white"
                      >
                        {testStatus["aws"] === "loading" ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                    </div>

                    {testStatus["aws"] === "success" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-green-800 text-sm font-medium">✅ Connection successful!</div>
                        <div className="text-green-600 text-xs mt-1">AWS integration is ready to use.</div>
                      </div>
                    )}
                    {testStatus["aws"] === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-800 text-sm font-medium">❌ Connection failed</div>
                        <div className="text-red-600 text-xs mt-1">Check your Role ARN and permissions.</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* GCP Integration */}
              <Card className="p-8 border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Image src="/globe.svg" alt="GCP" width={32} height={32} />
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700">Google Cloud Platform</h3>
                      <p className="text-gray-600">Connect using OAuth 2.0 Service Account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testStatus["gcp"] === "success" && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Connected
                      </span>
                    )}
                    {testStatus["gcp"] === "error" && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        ❌ Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">📋</span> Setup Instructions
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          Enable <a href="https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Cloud Billing API</a>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">APIs & Services → Credentials</a>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <div>Create OAuth 2.0 Client ID for web application</div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          Add authorized redirect URI: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://your-domain.com/auth/gcp</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="gcp-client-id" className="block text-sm font-medium text-blue-700 mb-2">
                        OAuth Client ID *
                      </label>
                      <input
                        id="gcp-client-id"
                        type="text"
                        value={integrationData.gcp.clientId}
                        onChange={(e) => handleInputChange("gcp", "clientId", e.target.value)}
                        placeholder="1234567890-abcdefg.apps.googleusercontent.com"
                        className="w-full border border-blue-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gcp-project-id" className="block text-sm font-medium text-blue-700 mb-2">
                        Project ID *
                      </label>
                      <input
                        id="gcp-project-id"
                        type="text"
                        value={integrationData.gcp.projectId}
                        onChange={(e) => handleInputChange("gcp", "projectId", e.target.value)}
                        placeholder="my-gcp-project-id"
                        className="w-full border border-blue-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => saveIntegration("gcp")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!integrationData.gcp.clientId || !integrationData.gcp.projectId}
                      >
                        Save Configuration
                      </Button>
                      <Button
                        onClick={() => handleTestConnection("gcp")}
                        disabled={testStatus["gcp"] === "loading" || !integrationData.gcp.clientId}
                        className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                      >
                        {testStatus["gcp"] === "loading" ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                    </div>

                    {testStatus["gcp"] === "success" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-green-800 text-sm font-medium">✅ Connection successful!</div>
                        <div className="text-green-600 text-xs mt-1">GCP integration is ready to use.</div>
                      </div>
                    )}
                    {testStatus["gcp"] === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-800 text-sm font-medium">❌ Connection failed</div>
                        <div className="text-red-600 text-xs mt-1">Check your Client ID and API permissions.</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Azure Integration */}
              <Card className="p-8 border-l-4 border-l-cyan-400 bg-gradient-to-r from-cyan-50 to-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Image src="/window.svg" alt="Azure" width={32} height={32} />
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-700">Microsoft Azure</h3>
                      <p className="text-gray-600">Connect using App Registration & Service Principal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testStatus["azure"] === "success" && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Connected
                      </span>
                    )}
                    {testStatus["azure"] === "error" && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        ❌ Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">📋</span> Setup Instructions
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex gap-3">
                        <span className="bg-cyan-100 text-cyan-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline font-medium">Azure Portal → App registrations</a>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-cyan-100 text-cyan-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <div>Create "New registration" → Name: CloudSpy</div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-cyan-100 text-cyan-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <div>Copy Application (client) ID and Directory (tenant) ID</div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-cyan-100 text-cyan-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          Assign <code className="bg-gray-100 px-2 py-1 rounded text-xs">Cost Management Reader</code> role to the app
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="azure-client-id" className="block text-sm font-medium text-cyan-700 mb-2">
                        Application (Client) ID *
                      </label>
                      <input
                        id="azure-client-id"
                        type="text"
                        value={integrationData.azure.clientId}
                        onChange={(e) => handleInputChange("azure", "clientId", e.target.value)}
                        placeholder="abcdefg-1234-5678-9101-abcdefabcdef"
                        className="w-full border border-cyan-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="azure-tenant-id" className="block text-sm font-medium text-cyan-700 mb-2">
                        Directory (Tenant) ID *
                      </label>
                      <input
                        id="azure-tenant-id"
                        type="text"
                        value={integrationData.azure.tenantId}
                        onChange={(e) => handleInputChange("azure", "tenantId", e.target.value)}
                        placeholder="hijklmn-5678-9101-1121-hijklmnhijkl"
                        className="w-full border border-cyan-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="azure-subscription-id" className="block text-sm font-medium text-cyan-700 mb-2">
                        Subscription ID *
                      </label>
                      <input
                        id="azure-subscription-id"
                        type="text"
                        value={integrationData.azure.subscriptionId}
                        onChange={(e) => handleInputChange("azure", "subscriptionId", e.target.value)}
                        placeholder="opqrstu-9101-1121-3141-opqrstuopqrs"
                        className="w-full border border-cyan-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => saveIntegration("azure")}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                        disabled={!integrationData.azure.clientId || !integrationData.azure.tenantId}
                      >
                        Save Configuration
                      </Button>
                      <Button
                        onClick={() => handleTestConnection("azure")}
                        disabled={testStatus["azure"] === "loading" || !integrationData.azure.clientId}
                        className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white"
                      >
                        {testStatus["azure"] === "loading" ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                    </div>

                    {testStatus["azure"] === "success" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-green-800 text-sm font-medium">✅ Connection successful!</div>
                        <div className="text-green-600 text-xs mt-1">Azure integration is ready to use.</div>
                      </div>
                    )}
                    {testStatus["azure"] === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-800 text-sm font-medium">❌ Connection failed</div>
                        <div className="text-red-600 text-xs mt-1">Check your credentials and permissions.</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Security Notice */}
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Security & Privacy</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• All integrations use read-only permissions</li>
                      <li>• Credentials are encrypted and stored securely</li>
                      <li>• No sensitive data is cached or logged</li>
                      <li>• You can revoke access anytime from your cloud console</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}