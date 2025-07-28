from fastapi import APIRouter, Query
import boto3
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/aws/connect")
def test_aws_connection(roleArn: str = Query(None, description="AWS IAM Role ARN for test connection")):
    if not roleArn:
        return JSONResponse(status_code=400, content={"error": "roleArn is required"})
    try:
        sts = boto3.client('sts')
        assumed = sts.assume_role(
            RoleArn=roleArn,
            RoleSessionName='TestConnectionSession'
        )
        creds = assumed['Credentials']
        ce = boto3.client(
            'ce',
            aws_access_key_id=creds['AccessKeyId'],
            aws_secret_access_key=creds['SecretAccessKey'],
            aws_session_token=creds['SessionToken']
        )
        today = datetime.utcnow().date()
        ce.get_cost_and_usage(
            TimePeriod={
                'Start': str(today),
                'End': str(today)
            },
            Granularity='MONTHLY',
            Metrics=['UnblendedCost'],
        )
        return JSONResponse(content={"success": True})
    except Exception as e:
        return JSONResponse(status_code=403, content={"error": str(e)})


@router.get("/aws/costs")
def get_aws_costs(
    start: str = Query(None, description="Start date in YYYY-MM-DD"),
    end: str = Query(None, description="End date in YYYY-MM-DD"),
    roleArn: str = Query(None, description="AWS IAM Role ARN for Cost Explorer access")
):
    if not roleArn:
        return JSONResponse(status_code=400, content={"error": "roleArn is required"})
    if not start and not end:
        return JSONResponse(status_code=400, content={"error": "Start date and end date must be provided"})
    try:

        sts = boto3.client('sts')
        assumed = sts.assume_role(
            RoleArn=roleArn if roleArn else 'arn:aws:iam::333749460279:role/CostExplorerReadOnlyAccessRole',
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
