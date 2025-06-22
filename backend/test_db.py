# backend/test_db.py
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key

# Connect to local DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url='http://localhost:8000',
    region_name='us-east-1',
    aws_access_key_id='fake',
    aws_secret_access_key='fake'
)

table = dynamodb.Table('Telemetry')

def save_telemetry(device_id, data):
    item = {
        'device_id': device_id,
        'timestamp': int(datetime.utcnow().timestamp()),
        **data
    }
    table.put_item(Item=item)
    print(f"✅ Saved: {item}")

def get_telemetry(device_id):
    response = table.query(
        KeyConditionExpression=Key('device_id').eq(device_id)
    )
    return response['Items']

# Test it
if __name__ == "__main__":
    print('--- Writing telemetry...')
    save_telemetry('esp-test-1', {'temp': 28})

    print('--- Querying telemetry...')
    items = get_telemetry('esp-test-1')
    for item in items:
        print(item)

