"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function HomePage() {
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
      {/* Hero Section */}
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

      {/* Chart Card */}
      <Card className="w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl border border-gray-100 mb-12 hover:scale-[1.02] transition-transform duration-300 bg-white/90">
        <h2 className="text-2xl font-bold text-amber-700 mb-4">Cloud Cost Trend</h2>
        <canvas ref={chartRef} height={220} />
      </Card>

      {/* Dashboard Links */}
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

      {/* Footer */}
      <footer className="text-xs text-gray-400 text-center py-6 mt-8">
        <span>
          🔐 Privacy first &nbsp;|&nbsp; 🌐 Cloud-agnostic &nbsp;|&nbsp; ⚡ Fast, clean, actionable UI
        </span>
      </footer>
    </div>
  );
}
