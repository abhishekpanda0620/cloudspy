from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
from utils.aws_utils import AWSCostManager
from models.schemas import CostMetric, ConnectionTest, ErrorResponse

router = APIRouter(prefix="/aws", tags=["AWS"])


@router.post("/test-connection")
def test_aws_connection(connection: ConnectionTest):
    """Test AWS connection with provided credentials"""
    try:
        creds = connection.credentials
        manager = AWSCostManager(
            role_arn=creds.get("role_arn"),
            access_key=creds.get("access_key"),
            secret_key=creds.get("secret_key"),
            session_token=creds.get("session_token"),
        )

        result = manager.test_connection()
        if result["success"]:
            return {"success": True, "message": result["message"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/costs", response_model=List[CostMetric])
def get_aws_costs(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    role_arn: Optional[str] = Query(None, description="AWS IAM Role ARN"),
    access_key: Optional[str] = Query(None, description="AWS Access Key"),
    secret_key: Optional[str] = Query(None, description="AWS Secret Key"),
    granularity: str = Query("MONTHLY", description="DAILY, MONTHLY, or YEARLY"),
    group_by: Optional[str] = Query(
        "SERVICE", description="Comma-separated list of dimensions"
    ),
):
    """Get AWS cost data"""
    try:
        # Validate date format
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")

        manager = AWSCostManager(
            role_arn=role_arn, access_key=access_key, secret_key=secret_key
        )

        group_by_list = group_by.split(",") if group_by else ["SERVICE"]
        costs = manager.get_costs(start_date, end_date, granularity, group_by_list)

        return costs

    except ValueError as e:
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use YYYY-MM-DD"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/services")
def get_aws_services(
    role_arn: Optional[str] = Query(None, description="AWS IAM Role ARN"),
    access_key: Optional[str] = Query(None, description="AWS Access Key"),
    secret_key: Optional[str] = Query(None, description="AWS Secret Key"),
):
    """Get list of AWS services with cost data"""
    try:
        manager = AWSCostManager(
            role_arn=role_arn, access_key=access_key, secret_key=secret_key
        )

        services = manager.get_services()
        return {"services": services}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
