from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from utils.gcp_utils import GCPCostManager
from models.schemas import CostMetric, ConnectionTest

router = APIRouter(prefix="/gcp", tags=["GCP"])

@router.post("/test-connection")
def test_gcp_connection(connection: ConnectionTest):
    """Test GCP connection with provided credentials"""
    try:
        creds = connection.credentials
        manager = GCPCostManager(
            project_id=creds.get("project_id"),
            service_account_key=creds.get("service_account_key")
        )
        
        result = manager.test_connection()
        if result["success"]:
            return {"success": True, "message": result["message"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/costs", response_model=List[CostMetric])
def get_gcp_costs(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    project_id: str = Query(..., description="GCP Project ID"),
    service_account_key: Optional[str] = Query(None, description="Service Account Key JSON"),
    granularity: str = Query("MONTHLY", description="DAILY or MONTHLY"),
    group_by: Optional[str] = Query("SERVICE", description="Comma-separated list of dimensions")
):
    """Get GCP cost data"""
    try:
        # Validate date format
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
        
        manager = GCPCostManager(
            project_id=project_id,
            service_account_key=service_account_key
        )
        
        group_by_list = group_by.split(",") if group_by else ["SERVICE"]
        costs = manager.get_costs(start_date, end_date, granularity, group_by_list)
        
        return costs
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects")
def get_gcp_projects(
    service_account_key: Optional[str] = Query(None, description="Service Account Key JSON")
):
    """Get list of GCP projects"""
    try:
        manager = GCPCostManager(service_account_key=service_account_key)
        projects = manager.get_projects()
        return {"projects": projects}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/billing-accounts")
def get_gcp_billing_accounts(
    service_account_key: Optional[str] = Query(None, description="Service Account Key JSON")
):
    """Get list of GCP billing accounts"""
    try:
        manager = GCPCostManager(service_account_key=service_account_key)
        accounts = manager.get_billing_accounts()
        return {"billing_accounts": accounts}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))