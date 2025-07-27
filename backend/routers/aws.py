from fastapi import APIRouter, Query
import boto3
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/aws/costs")
def get_aws_costs(
    start: str = Query(None, description="Start date in YYYY-MM-DD"),
    end: str = Query(None, description="End date in YYYY-MM-DD")
):
    try:
        # Use env vars or IAM role (best practice)
        # client = boto3.client("ce", region_name="us-east-1")
        sts = boto3.client('sts')
        assumed = sts.assume_role(
            RoleArn='arn:aws:iam::333749460279:role/CostExplorerReadOnlyAccessRole',
            RoleSessionName='CostAccessSession'
        )
        creds = assumed['Credentials']
        ce = boto3.client(
            'ce',
            aws_access_key_id=creds['AccessKeyId'],
            aws_secret_access_key=creds['SecretAccessKey'],
            aws_session_token=creds['SessionToken']
        )
        # Default to previous 30 days if not provided
        if not end:
            end_date = datetime.utcnow().date()
        else:
            end_date = datetime.strptime(end, "%Y-%m-%d").date()

        if not start:
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.strptime(start, "%Y-%m-%d").date()

        response = ce.get_cost_and_usage(
            TimePeriod={
                'Start': str(start_date),
                'End': str(end_date)
            },
            Granularity='MONTHLY',
            Metrics = ['UnblendedCost', 'NetUnblendedCost'],
            GroupBy=[
                {"Type": "DIMENSION", "Key": "SERVICE"}
            ]
        )
        raw_data = response['ResultsByTime'][0]['Groups']
        return raw_data
        normalized = []
        for item in raw_data:
            amount = float(item["Metrics"]["UnblendedCost"]["Amount"])
            normalized.append({
                "service": item["Keys"][0],
                "amount": amount,
                "unit": item["Metrics"]["UnblendedCost"]["Unit"]
            })

        return JSONResponse(content=normalized)

    except Exception as e:
        return {"error": str(e)}
