from azure.identity import ClientSecretCredential, DefaultAzureCredential
from azure.mgmt.costmanagement import CostManagementClient
from azure.mgmt.resource import ResourceManagementClient
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models.schemas import CostMetric

class AzureCostManager:
    def __init__(self, tenant_id: Optional[str] = None, client_id: Optional[str] = None, 
                 client_secret: Optional[str] = None, subscription_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.subscription_id = subscription_id
        self._credential = None
        self._cost_client = None

    def _get_credential(self):
        """Get Azure credential"""
        if not self._credential:
            if self.tenant_id and self.client_id and self.client_secret:
                self._credential = ClientSecretCredential(
                    tenant_id=self.tenant_id,
                    client_id=self.client_id,
                    client_secret=self.client_secret
                )
            else:
                self._credential = DefaultAzureCredential()
        return self._credential

    def _get_cost_client(self):
        """Get Cost Management client"""
        if not self._cost_client:
            credential = self._get_credential()
            self._cost_client = CostManagementClient(credential)
        return self._cost_client

    def test_connection(self) -> Dict[str, Any]:
        """Test Azure connection and permissions"""
        try:
            if not self.subscription_id:
                return {"success": False, "error": "Subscription ID is required"}
                
            credential = self._get_credential()
            resource_client = ResourceManagementClient(credential, self.subscription_id)
            
            # Test by listing resource groups (minimal permission required)
            list(resource_client.resource_groups.list())
            
            return {"success": True, "message": "Connection successful"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_costs(self, start_date: str, end_date: str, granularity: str = "Monthly", 
                  group_by: List[str] = None) -> List[CostMetric]:
        """Get cost data from Azure Cost Management"""
        if not self.subscription_id:
            raise Exception("Subscription ID is required")
            
        try:
            cost_client = self._get_cost_client()
            scope = f"/subscriptions/{self.subscription_id}"
            
            # Convert granularity to Azure format
            azure_granularity = granularity.capitalize()
            if azure_granularity not in ["Daily", "Monthly"]:
                azure_granularity = "Monthly"
            
            # Prepare grouping
            grouping = []
            if group_by:
                for group in group_by:
                    if group.upper() == "SERVICE":
                        grouping.append({
                            "type": "Dimension",
                            "name": "ServiceName"
                        })
                    elif group.upper() == "RESOURCE":
                        grouping.append({
                            "type": "Dimension", 
                            "name": "ResourceId"
                        })
            
            query_definition = {
                "type": "ActualCost",
                "timeframe": "Custom",
                "timePeriod": {
                    "from": start_date,
                    "to": end_date
                },
                "dataset": {
                    "granularity": azure_granularity,
                    "aggregation": {
                        "totalCost": {
                            "name": "PreTaxCost",
                            "function": "Sum"
                        }
                    },
                    "grouping": grouping
                }
            }
            
            result = cost_client.query.usage(scope, query_definition)
            
            costs = []
            if hasattr(result, 'rows') and result.rows:
                columns = [col.name for col in result.columns]
                
                for row in result.rows:
                    row_data = dict(zip(columns, row))
                    
                    service_name = "Unknown"
                    if "ServiceName" in row_data:
                        service_name = row_data["ServiceName"]
                    elif "ResourceId" in row_data:
                        service_name = row_data["ResourceId"].split('/')[-1] if row_data["ResourceId"] else "Unknown"
                    
                    amount = float(row_data.get("PreTaxCost", 0))
                    date = row_data.get("UsageDate", start_date)
                    
                    costs.append(CostMetric(
                        service=service_name,
                        amount=amount,
                        unit="USD",
                        date=str(date)
                    ))
            
            return costs
            
        except Exception as e:
            raise Exception(f"Failed to retrieve Azure costs: {str(e)}")

    def get_subscriptions(self) -> List[Dict[str, str]]:
        """Get list of available subscriptions"""
        try:
            credential = self._get_credential()
            resource_client = ResourceManagementClient(credential, self.subscription_id)
            
            subscriptions = []
            for sub in resource_client.subscriptions.list():
                subscriptions.append({
                    "id": sub.subscription_id,
                    "name": sub.display_name,
                    "state": sub.state.value if sub.state else "Unknown"
                })
            
            return subscriptions
            
        except Exception as e:
            raise Exception(f"Failed to retrieve Azure subscriptions: {str(e)}")