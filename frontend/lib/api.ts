const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAwsCosts = async (params?: { start?: string; end?: string; roleArn?: string }) => {
  if (!API_URL) throw new Error("API URL is not defined in environment variables");
  let url = `${API_URL}/aws/costs`;
  const query: string[] = [];
  if (params?.start) query.push(`start=${encodeURIComponent(params.start)}`);
  if (params?.end) query.push(`end=${encodeURIComponent(params.end)}`);
  if (params?.roleArn) query.push(`roleArn=${encodeURIComponent(params.roleArn)}`);
  if (query.length) url += `?${query.join('&')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch AWS costs");
  return res.json();
};
