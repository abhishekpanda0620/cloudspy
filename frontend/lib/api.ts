const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAwsCosts = async (params?: { start?: string; end?: string; region?: string }) => {
  if (!API_URL) throw new Error("API URL is not defined in environment variables");
  let url = `${API_URL}/aws/costs`;
  if (params?.start && params?.end) {
    url += `?start=${encodeURIComponent(params.start)}&end=${encodeURIComponent(params.end)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch AWS costs");
  return res.json();
};
