import boto3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from botocore.exceptions import ClientError, NoCredentialsError
from models.schemas import CostMetric


class AWSCostManager:
    def __init__(
        self,
        role_arn: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        session_token: Optional[str] = None,
    ):
        self.role_arn = role_arn
        self.access_key = access_key
        self.secret_key = secret_key
        self.session_token = session_token
        self._ce_client = None

    def _get_credentials(self) -> Dict[str, str]:
        """Get AWS credentials either from role assumption or direct credentials"""
        if self.role_arn:
            sts = boto3.client("sts")
            assumed = sts.assume_role(
                RoleArn=self.role_arn, RoleSessionName="CloudSpyCostSession"
            )
            creds = assumed["Credentials"]
            return {
                "aws_access_key_id": creds["AccessKeyId"],
                "aws_secret_access_key": creds["SecretAccessKey"],
                "aws_session_token": creds["SessionToken"],
            }
        elif self.access_key and self.secret_key:
            return {
                "aws_access_key_id": self.access_key,
                "aws_secret_access_key": self.secret_key,
                "aws_session_token": self.session_token,
            }
        else:
            return {}  # Use default credentials

    def _get_cost_explorer_client(self):
        """Get Cost Explorer client with appropriate credentials"""
        if not self._ce_client:
            creds = self._get_credentials()
            self._ce_client = boto3.client("ce", **creds)
        return self._ce_client

    def test_connection(self) -> Dict[str, Any]:
        """Test AWS connection and permissions"""
        try:
            ce = self._get_cost_explorer_client()
            today = datetime.utcnow().date()

            # Test with minimal request
            ce.get_cost_and_usage(
                TimePeriod={"Start": str(today - timedelta(days=1)), "End": str(today)},
                Granularity="DAILY",
                Metrics=["UnblendedCost"],
            )
            return {"success": True, "message": "Connection successful"}
        except ClientError as e:
            return {
                "success": False,
                "error": f"AWS API Error: {e.response['Error']['Message']}",
            }
        except NoCredentialsError:
            return {"success": False, "error": "No valid AWS credentials found"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_costs(self, start_date: str, end_date: str, granularity: str = "MONTHLY", 
                  group_by: List[str] = None) -> List[CostMetric]:
        """Get cost data from AWS Cost Explorer"""
        if group_by is None:
            group_by = ["SERVICE"]

        try:
            ce = self._get_cost_explorer_client()

            group_by_params = [{"Type": "DIMENSION", "Key": key} for key in group_by]

            response = ce.get_cost_and_usage(
                TimePeriod={"Start": start_date, "End": end_date},
                Granularity=granularity,
                Metrics=["UnblendedCost", "NetUnblendedCost"],
                GroupBy=group_by_params,
            )

            costs = []
            for time_period in response["ResultsByTime"]:
                period_start = time_period["TimePeriod"]["Start"]

                for group in time_period["Groups"]:
                    service_name = group["Keys"][0] if group["Keys"] else "Unknown"
                    amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
                    unit = group["Metrics"]["UnblendedCost"]["Unit"]

                    costs.append(
                        CostMetric(
                            service=service_name,
                            amount=amount,
                            unit=unit,
                            date=period_start,
                        )
                    )

            return costs

        except Exception as e:
            raise Exception(f"Failed to retrieve AWS costs: {str(e)}")

    def get_services(self) -> List[str]:
        """Get list of AWS services with cost data"""
        try:
            ce = self._get_cost_explorer_client()
            end_date = datetime.utcnow().date()
            start_date = end_date - timedelta(days=30)

            response = ce.get_dimension_values(
                Dimension="SERVICE",
                TimePeriod={"Start": str(start_date), "End": str(end_date)},
            )

            return [item["Value"] for item in response["DimensionValues"]]

        except Exception as e:
            raise Exception(f"Failed to retrieve AWS services: {str(e)}")
