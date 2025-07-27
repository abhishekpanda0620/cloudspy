'use client';

import { useEffect, useState } from 'react';
import { fetchAwsCosts } from '../../../lib/api';
import DashboardLayout from '../DashboardLayout';


type CostItem = {
  service: string;
  amount: number;
  unit: string;
};

export default function AwsPage() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const firstDayStr = `${yyyy}-${mm}-01`;
  const [data, setData] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(firstDayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [error, setError] = useState<string | null>(null);
  const [roleArn, setRoleArn] = useState<string>("");

  const handleFetch = () => {
    setLoading(true);
    setError(null);
    fetchAwsCosts({ start: startDate, end: endDate, roleArn })
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

  // Calculate total cost (placeholder logic)
  const totalCost = Array.isArray(data) ? data.reduce((sum, item) => sum + item.amount, 0) : 0;

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          {/* <Image src="/aws.svg" alt="AWS" width={40} height={40} /> */}
          <div>
            <h1 className="text-3xl font-bold text-amber-700">AWS Cost Dashboard</h1>
            <p className="text-gray-600 text-sm">Unified visibility into your AWS cloud spend. Secure, actionable, and cloud-agnostic.</p>
          </div>
        </div>
        {/* Role ARN Input */}
        <div className="flex gap-4 items-center mb-6 flex-wrap">
          <label htmlFor="role-arn" className="text-sm text-amber-700 font-medium">Role ARN:</label>
          <input
            id="role-arn"
            type="text"
            value={roleArn}
            onChange={e => setRoleArn(e.target.value)}
            placeholder="Paste your AWS Role ARN here"
            className="border border-amber-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-96"
          />
          <button
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition text-sm font-semibold"
            onClick={handleFetch}
            disabled={loading || !roleArn}
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>

        {/* Date Range & Region Picker */}
        <div className="flex gap-4 items-center mb-6 flex-wrap">
          <label className="text-sm text-gray-700 font-medium">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
            max={endDate}
          />
          <label className="text-sm text-gray-700 font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
            min={startDate}
          />
         
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex items-center justify-between">
          <div>
            <div className="text-lg text-gray-500">Total Cost ({startDate} to {endDate})</div>
            <div className="text-3xl font-bold text-amber-700">${totalCost.toFixed(2)}</div>
            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </div>
          <div className="flex flex-col items-end">
            {/* Placeholder for trend chart */}
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">Trend: Stable</span>
            <span className="text-xs text-gray-400 mt-1">(Trend chart coming soon)</span>
          </div>
        </div>

        {/* Costs Table */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-amber-700">Service Breakdown</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <svg className="animate-spin h-8 w-8 text-amber-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-gray-500">Loading AWS cost data...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50">
                  <th className="py-2 px-3 font-medium text-gray-700">Service</th>
                  <th className="py-2 px-3 font-medium text-gray-700">Amount</th>
                  <th className="py-2 px-3 font-medium text-gray-700">Unit</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-none hover:bg-amber-50 transition">
                    <td className="py-2 px-3 flex items-center gap-2">
                      {/* Placeholder for service icon */}
                      <span className="inline-block h-5 w-5 bg-amber-200 rounded-full" />
                      <span className="font-semibold text-gray-800">{item.service}</span>
                    </td>
                    <td className="py-2 px-3 text-amber-700 font-bold">${item.amount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-gray-600">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
