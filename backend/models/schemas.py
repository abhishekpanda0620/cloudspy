from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CloudProvider(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"

class CostMetric(BaseModel):
    service: str
    amount: float
    unit: str = "USD"
    currency: str = "USD"
    date: Optional[str] = None

class CloudConnection(BaseModel):
    provider: CloudProvider
    connection_name: str
    credentials: Dict[str, Any]
    is_active: bool = True
    created_at: Optional[datetime] = None

class CostRequest(BaseModel):
    provider: CloudProvider
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    granularity: str = Field(default="MONTHLY", description="DAILY, MONTHLY, or YEARLY")
    group_by: Optional[List[str]] = Field(default=["SERVICE"], description="Group by dimensions")

class DashboardSummary(BaseModel):
    total_cost: float
    cost_by_provider: Dict[str, float]
    cost_by_service: List[CostMetric]
    period: str
    last_updated: datetime

class ConnectionTest(BaseModel):
    provider: CloudProvider
    credentials: Dict[str, Any]

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None