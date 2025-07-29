#!/usr/bin/env python3
"""
Simple test script to verify CloudSpy backend API endpoints
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:9090/api/v1"

def test_health_endpoints():
    """Test health check endpoints"""
    print("Testing health endpoints...")
    
    # Root health
    response = requests.get("http://localhost:9090/health")
    print(f"Root health: {response.status_code} - {response.json()}")
    
    # Dashboard health
    response = requests.get(f"{BASE_URL}/dashboard/health")
    print(f"Dashboard health: {response.status_code} - {response.json()}")
    
    # Auth health
    response = requests.get(f"{BASE_URL}/auth/health")
    print(f"Auth health: {response.status_code} - {response.json()}")

def test_aws_endpoints():
    """Test AWS endpoints (without actual credentials)"""
    print("\nTesting AWS endpoints...")
    
    # Test connection (should fail without credentials)
    test_data = {
        "provider": "aws",
        "credentials": {
            "role_arn": "arn:aws:iam::123456789012:role/TestRole"
        }
    }
    
    response = requests.post(f"{BASE_URL}/aws/test-connection", json=test_data)
    print(f"AWS test connection: {response.status_code}")
    
    # Test costs endpoint (should fail without credentials)
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "role_arn": "arn:aws:iam::123456789012:role/TestRole"
    }
    
    response = requests.get(f"{BASE_URL}/aws/costs", params=params)
    print(f"AWS costs: {response.status_code}")

def test_dashboard_endpoints():
    """Test dashboard endpoints"""
    print("\nTesting dashboard endpoints...")
    
    # Test summary (without credentials - should return empty data)
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    params = {
        "start_date": start_date,
        "end_date": end_date
    }
    
    response = requests.get(f"{BASE_URL}/dashboard/summary", params=params)
    print(f"Dashboard summary: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  Total cost: ${data.get('total_cost', 0)}")
        print(f"  Providers: {list(data.get('cost_by_provider', {}).keys())}")

if __name__ == "__main__":
    print("CloudSpy Backend API Test")
    print("=" * 40)
    
    try:
        test_health_endpoints()
        test_aws_endpoints()
        test_dashboard_endpoints()
        print("\n✅ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on http://localhost:9090")
    except Exception as e:
        print(f"❌ Test failed: {e}")