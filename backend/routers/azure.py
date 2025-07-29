from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from utils.azure_utils import AzureCostManager
from models.schemas import CostMetric, ConnectionTest

router = APIRouter(prefix="/azure", tags=["Azure"])

@router.post("/test-connection")
def test_azure_connection(connection: ConnectionTest):
    """Test Azure connection with provided credentials"""
    try:
        creds = connection.credentials
        manager = AzureCostManager(
            tenant_id=creds.get("tenant_id"),
            client_id=creds.get("client_id"),
            client_secret=creds.get("client_secret"),
            subscription_id=creds.get("subscription_id")
        )
        
        result = manager.test_connection()
        if result["success"]:
            return {"success": True, "message": result["message"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/costs", response_model=List[CostMetric])
def get_azure_costs(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    subscription_id: str = Query(..., description="Azure Subscription ID"),
    tenant_id: Optional[str] = Query(None, description="Azure Tenant ID"),
    client_id: Optional[str] = Query(None, description="Azure Client ID"),
    client_secret: Optional[str] = Query(None, description="Azure Client Secret"),
    granularity: str = Query("Monthly", description="Daily or Monthly"),
    group_by: Optional[str] = Query("SERVICE", description="Comma-separated list of dimensions")
):
    """Get Azure cost data"""
    try:
        # Validate date format
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
        
        manager = AzureCostManager(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            subscription_id=subscription_id
        )
        
        group_by_list = group_by.split(",") if group_by else ["SERVICE"]
        costs = manager.get_costs(start_date, end_date, granularity, group_by_list)
        
        return costs
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subscriptions")
def get_azure_subscriptions(
    tenant_id: Optional[str] = Query(None, description="Azure Tenant ID"),
    client_id: Optional[str] = Query(None, description="Azure Client ID"),
    client_secret: Optional[str] = Query(None, description="Azure Client Secret")
):
    """Get list of Azure subscriptions"""
    try:
        manager = AzureCostManager(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )
        
        subscriptions = manager.get_subscriptions()
        return {"subscriptions": subscriptions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))