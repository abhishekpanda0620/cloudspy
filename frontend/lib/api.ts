const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAwsCosts = async (params?: {
  start_date?: string;
  end_date?: string;
  role_arn?: string;
}) => {
  if (!API_URL)
    throw new Error("API URL is not defined in environment variables");
  let url = `${API_URL}/api/v1/aws/costs`;
  const query: string[] = [];
  if (params?.start_date)
    query.push(`start_date=${encodeURIComponent(params.start_date)}`);
  if (params?.end_date)
    query.push(`end_date=${encodeURIComponent(params.end_date)}`);
  if (params?.role_arn)
    query.push(`role_arn=${encodeURIComponent(params.role_arn)}`);
  if (query.length) url += `?${query.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch AWS costs");
  return res.json();
};
export const testAwsConnection = async (credentials: {
  role_arn?: string;
  access_key?: string;
  secret_key?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  const res = await fetch(`${API_URL}/api/v1/aws/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "aws", credentials }),
  });
  if (!res.ok) throw new Error("Failed to test AWS connection");
  return res.json();
};

// Azure API
export const fetchAzureCosts = async (params?: {
  start_date?: string;
  end_date?: string;
  subscription_id?: string;
  tenant_id?: string;
  client_id?: string;
  client_secret?: string;
  granularity?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  let url = `${API_URL}/api/v1/azure/costs`;
  const query: string[] = [];
  if (params?.start_date)
    query.push(`start_date=${encodeURIComponent(params.start_date)}`);
  if (params?.end_date)
    query.push(`end_date=${encodeURIComponent(params.end_date)}`);
  if (params?.subscription_id)
    query.push(`subscription_id=${encodeURIComponent(params.subscription_id)}`);
  if (params?.tenant_id)
    query.push(`tenant_id=${encodeURIComponent(params.tenant_id)}`);
  if (params?.client_id)
    query.push(`client_id=${encodeURIComponent(params.client_id)}`);
  if (params?.client_secret)
    query.push(`client_secret=${encodeURIComponent(params.client_secret)}`);
  if (params?.granularity)
    query.push(`granularity=${encodeURIComponent(params.granularity)}`);
  if (query.length) url += `?${query.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Azure costs");
  return res.json();
};

export const testAzureConnection = async (credentials: {
  tenant_id?: string;
  client_id?: string;
  client_secret?: string;
  subscription_id?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  const res = await fetch(`${API_URL}/api/v1/azure/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "azure", credentials }),
  });
  if (!res.ok) throw new Error("Failed to test Azure connection");
  return res.json();
};

// GCP API
export const fetchGcpCosts = async (params?: {
  start_date?: string;
  end_date?: string;
  project_id?: string;
  service_account_key?: string;
  granularity?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  let url = `${API_URL}/api/v1/gcp/costs`;
  const query: string[] = [];
  if (params?.start_date)
    query.push(`start_date=${encodeURIComponent(params.start_date)}`);
  if (params?.end_date)
    query.push(`end_date=${encodeURIComponent(params.end_date)}`);
  if (params?.project_id)
    query.push(`project_id=${encodeURIComponent(params.project_id)}`);
  if (params?.service_account_key)
    query.push(
      `service_account_key=${encodeURIComponent(params.service_account_key)}`
    );
  if (params?.granularity)
    query.push(`granularity=${encodeURIComponent(params.granularity)}`);
  if (query.length) url += `?${query.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch GCP costs");
  return res.json();
};

export const testGcpConnection = async (credentials: {
  project_id?: string;
  service_account_key?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  const res = await fetch(`${API_URL}/api/v1/gcp/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "gcp", credentials }),
  });
  if (!res.ok) throw new Error("Failed to test GCP connection");
  return res.json();
};

// Dashboard API
export const fetchDashboardSummary = async (params?: {
  start_date?: string;
  end_date?: string;
  aws_role_arn?: string;
  azure_subscription_id?: string;
  azure_tenant_id?: string;
  azure_client_id?: string;
  azure_client_secret?: string;
  gcp_project_id?: string;
  gcp_service_account_key?: string;
}) => {
  if (!API_URL) throw new Error("API URL is not defined");
  let url = `${API_URL}/api/v1/dashboard/summary`;
  const query: string[] = [];
  if (params?.start_date)
    query.push(`start_date=${encodeURIComponent(params.start_date)}`);
  if (params?.end_date)
    query.push(`end_date=${encodeURIComponent(params.end_date)}`);
  if (params?.aws_role_arn)
    query.push(`aws_role_arn=${encodeURIComponent(params.aws_role_arn)}`);
  if (params?.azure_subscription_id)
    query.push(
      `azure_subscription_id=${encodeURIComponent(
        params.azure_subscription_id
      )}`
    );
  if (params?.azure_tenant_id)
    query.push(`azure_tenant_id=${encodeURIComponent(params.azure_tenant_id)}`);
  if (params?.azure_client_id)
    query.push(`azure_client_id=${encodeURIComponent(params.azure_client_id)}`);
  if (params?.azure_client_secret)
    query.push(
      `azure_client_secret=${encodeURIComponent(params.azure_client_secret)}`
    );
  if (params?.gcp_project_id)
    query.push(`gcp_project_id=${encodeURIComponent(params.gcp_project_id)}`);
  if (params?.gcp_service_account_key)
    query.push(
      `gcp_service_account_key=${encodeURIComponent(
        params.gcp_service_account_key
      )}`
    );
  if (query.length) url += `?${query.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
};
