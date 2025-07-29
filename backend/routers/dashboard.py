from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from utils.aws_utils import AWSCostManager
from utils.azure_utils import AzureCostManager
from utils.gcp_utils import GCPCostManager
from models.schemas import DashboardSummary, CostMetric, CloudProvider

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    # AWS credentials
    aws_role_arn: Optional[str] = Query(None),
    aws_access_key: Optional[str] = Query(None),
    aws_secret_key: Optional[str] = Query(None),
    # Azure credentials
    azure_tenant_id: Optional[str] = Query(None),
    azure_client_id: Optional[str] = Query(None),
    azure_client_secret: Optional[str] = Query(None),
    azure_subscription_id: Optional[str] = Query(None),
    # GCP credentials
    gcp_project_id: Optional[str] = Query(None),
    gcp_service_account_key: Optional[str] = Query(None)
):
    """Get comprehensive dashboard summary across all cloud providers"""
    try:
        # Default to last 30 days if dates not provided
        if not end_date:
            end_date = datetime.utcnow().date().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.utcnow().date() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        total_cost = 0.0
        cost_by_provider = {}
        all_costs = []
        
        # AWS costs
        if aws_role_arn or aws_access_key:
            try:
                aws_manager = AWSCostManager(
                    role_arn=aws_role_arn,
                    access_key=aws_access_key,
                    secret_key=aws_secret_key
                )
                aws_costs = aws_manager.get_costs(start_date, end_date)
                aws_total = sum(cost.amount for cost in aws_costs)
                cost_by_provider["aws"] = aws_total
                total_cost += aws_total
                all_costs.extend(aws_costs)
            except Exception as e:
                print(f"AWS cost retrieval failed: {e}")
                cost_by_provider["aws"] = 0.0
        
        # Azure costs
        if azure_subscription_id:
            try:
                azure_manager = AzureCostManager(
                    tenant_id=azure_tenant_id,
                    client_id=azure_client_id,
                    client_secret=azure_client_secret,
                    subscription_id=azure_subscription_id
                )
                azure_costs = azure_manager.get_costs(start_date, end_date)
                azure_total = sum(cost.amount for cost in azure_costs)
                cost_by_provider["azure"] = azure_total
                total_cost += azure_total
                all_costs.extend(azure_costs)
            except Exception as e:
                print(f"Azure cost retrieval failed: {e}")
                cost_by_provider["azure"] = 0.0
        
        # GCP costs
        if gcp_project_id:
            try:
                gcp_manager = GCPCostManager(
                    project_id=gcp_project_id,
                    service_account_key=gcp_service_account_key
                )
                gcp_costs = gcp_manager.get_costs(start_date, end_date)
                gcp_total = sum(cost.amount for cost in gcp_costs)
                cost_by_provider["gcp"] = gcp_total
                total_cost += gcp_total
                all_costs.extend(gcp_costs)
            except Exception as e:
                print(f"GCP cost retrieval failed: {e}")
                cost_by_provider["gcp"] = 0.0
        
        # Aggregate costs by service across all providers
        service_costs = {}
        for cost in all_costs:
            if cost.service in service_costs:
                service_costs[cost.service] += cost.amount
            else:
                service_costs[cost.service] = cost.amount
        
        # Convert to list of CostMetric objects
        cost_by_service = [
            CostMetric(service=service, amount=amount, unit="USD")
            for service, amount in sorted(service_costs.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return DashboardSummary(
            total_cost=total_cost,
            cost_by_provider=cost_by_provider,
            cost_by_service=cost_by_service[:10],  # Top 10 services
            period=f"{start_date} to {end_date}",
            last_updated=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/costs/comparison")
def get_cost_comparison(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    providers: str = Query(..., description="Comma-separated list of providers (aws,azure,gcp)"),
    # Credentials (same as above)
    aws_role_arn: Optional[str] = Query(None),
    aws_access_key: Optional[str] = Query(None),
    aws_secret_key: Optional[str] = Query(None),
    azure_tenant_id: Optional[str] = Query(None),
    azure_client_id: Optional[str] = Query(None),
    azure_client_secret: Optional[str] = Query(None),
    azure_subscription_id: Optional[str] = Query(None),
    gcp_project_id: Optional[str] = Query(None),
    gcp_service_account_key: Optional[str] = Query(None)
):
    """Compare costs across selected cloud providers"""
    try:
        provider_list = [p.strip().lower() for p in providers.split(",")]
        comparison_data = {}
        
        for provider in provider_list:
            if provider == "aws" and (aws_role_arn or aws_access_key):
                try:
                    manager = AWSCostManager(aws_role_arn, aws_access_key, aws_secret_key)
                    costs = manager.get_costs(start_date, end_date)
                    comparison_data["aws"] = {
                        "total": sum(cost.amount for cost in costs),
                        "services": len(set(cost.service for cost in costs)),
                        "top_service": max(costs, key=lambda x: x.amount).service if costs else "N/A"
                    }
                except Exception as e:
                    comparison_data["aws"] = {"error": str(e)}
            
            elif provider == "azure" and azure_subscription_id:
                try:
                    manager = AzureCostManager(azure_tenant_id, azure_client_id, azure_client_secret, azure_subscription_id)
                    costs = manager.get_costs(start_date, end_date)
                    comparison_data["azure"] = {
                        "total": sum(cost.amount for cost in costs),
                        "services": len(set(cost.service for cost in costs)),
                        "top_service": max(costs, key=lambda x: x.amount).service if costs else "N/A"
                    }
                except Exception as e:
                    comparison_data["azure"] = {"error": str(e)}
            
            elif provider == "gcp" and gcp_project_id:
                try:
                    manager = GCPCostManager(gcp_project_id, gcp_service_account_key)
                    costs = manager.get_costs(start_date, end_date)
                    comparison_data["gcp"] = {
                        "total": sum(cost.amount for cost in costs),
                        "services": len(set(cost.service for cost in costs)),
                        "top_service": max(costs, key=lambda x: x.amount).service if costs else "N/A"
                    }
                except Exception as e:
                    comparison_data["gcp"] = {"error": str(e)}
        
        return {
            "period": f"{start_date} to {end_date}",
            "providers": comparison_data,
            "total_across_providers": sum(
                data.get("total", 0) for data in comparison_data.values() 
                if isinstance(data, dict) and "total" in data
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def dashboard_health():
    """Health check endpoint for dashboard services"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "aws": "available",
            "azure": "available", 
            "gcp": "available"
        }
    }