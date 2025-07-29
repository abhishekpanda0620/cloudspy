from google.auth import default
from google.auth.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
from models.schemas import CostMetric

class GCPCostManager:
    def __init__(self, project_id: Optional[str] = None, service_account_key: Optional[str] = None):
        self.project_id = project_id
        self.service_account_key = service_account_key
        self._credentials = None
        self._billing_service = None

    def _get_credentials(self) -> Credentials:
        """Get GCP credentials"""
        if not self._credentials:
            if self.service_account_key:
                # Load from service account key
                if isinstance(self.service_account_key, str):
                    key_data = json.loads(self.service_account_key)
                else:
                    key_data = self.service_account_key
                    
                self._credentials = service_account.Credentials.from_service_account_info(
                    key_data,
                    scopes=['https://www.googleapis.com/auth/cloud-billing.readonly',
                           'https://www.googleapis.com/auth/cloud-platform.read-only']
                )
            else:
                # Use default credentials
                self._credentials, _ = default(
                    scopes=['https://www.googleapis.com/auth/cloud-billing.readonly',
                           'https://www.googleapis.com/auth/cloud-platform.read-only']
                )
        return self._credentials

    def _get_billing_service(self):
        """Get Cloud Billing service"""
        if not self._billing_service:
            credentials = self._get_credentials()
            self._billing_service = build('cloudbilling', 'v1', credentials=credentials)
        return self._billing_service

    def test_connection(self) -> Dict[str, Any]:
        """Test GCP connection and permissions"""
        try:
            service = self._get_billing_service()
            
            # Test by listing billing accounts
            result = service.billingAccounts().list().execute()
            
            if not result.get('billingAccounts'):
                return {"success": False, "error": "No billing accounts found or insufficient permissions"}
            
            return {"success": True, "message": "Connection successful"}
        except HttpError as e:
            return {"success": False, "error": f"GCP API Error: {e.reason}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_costs(self, start_date: str, end_date: str, granularity: str = "MONTHLY", 
                  group_by: List[str] = None) -> List[CostMetric]:
        """Get cost data from GCP Cloud Billing"""
        if not self.project_id:
            raise Exception("Project ID is required")
            
        try:
            service = self._get_billing_service()
            
            # Get billing account for the project
            billing_accounts = service.billingAccounts().list().execute()
            if not billing_accounts.get('billingAccounts'):
                raise Exception("No billing accounts found")
            
            billing_account = billing_accounts['billingAccounts'][0]['name']
            
            # Convert dates to the required format
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            
            # Build the query
            query = {
                "aggregation": {
                    "alignmentPeriod": "86400s",  # Daily alignment
                    "perSeriesAligner": "ALIGN_SUM",
                    "crossSeriesReducer": "REDUCE_SUM",
                    "groupByFields": []
                },
                "filter": f'resource.labels.project_id="{self.project_id}"',
                "interval": {
                    "startTime": start_dt.isoformat() + "Z",
                    "endTime": end_dt.isoformat() + "Z"
                }
            }
            
            # Add grouping
            if group_by:
                for group in group_by:
                    if group.upper() == "SERVICE":
                        query["aggregation"]["groupByFields"].append("resource.labels.service")
                    elif group.upper() == "SKU":
                        query["aggregation"]["groupByFields"].append("resource.labels.sku_description")
            
            # Note: GCP doesn't have a direct cost API like AWS/Azure
            # This is a simplified implementation - in practice, you'd use:
            # 1. Cloud Billing API for billing data
            # 2. Cloud Asset Inventory for resource costs
            # 3. BigQuery export for detailed cost analysis
            
            # For now, return mock data structure
            costs = []
            
            # This would be replaced with actual GCP billing API calls
            # The actual implementation would involve:
            # - Using the Cloud Billing API to get cost data
            # - Parsing the response to extract service costs
            # - Converting to our standard CostMetric format
            
            return costs
            
        except Exception as e:
            raise Exception(f"Failed to retrieve GCP costs: {str(e)}")

    def get_projects(self) -> List[Dict[str, str]]:
        """Get list of available projects"""
        try:
            credentials = self._get_credentials()
            service = build('cloudresourcemanager', 'v1', credentials=credentials)
            
            result = service.projects().list().execute()
            projects = []
            
            for project in result.get('projects', []):
                if project.get('lifecycleState') == 'ACTIVE':
                    projects.append({
                        "id": project['projectId'],
                        "name": project.get('name', project['projectId']),
                        "number": project['projectNumber']
                    })
            
            return projects
            
        except Exception as e:
            raise Exception(f"Failed to retrieve GCP projects: {str(e)}")

    def get_billing_accounts(self) -> List[Dict[str, str]]:
        """Get list of billing accounts"""
        try:
            service = self._get_billing_service()
            result = service.billingAccounts().list().execute()
            
            accounts = []
            for account in result.get('billingAccounts', []):
                accounts.append({
                    "name": account['name'],
                    "displayName": account.get('displayName', 'Unknown'),
                    "open": account.get('open', False)
                })
            
            return accounts
            
        except Exception as e:
            raise Exception(f"Failed to retrieve GCP billing accounts: {str(e)}")