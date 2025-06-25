from fastapi import APIRouter
from app.dynamodb import get_db_telemetry, device_scan
from app.models import TelemetryResponse

router = APIRouter()


@router.get("/telemetry", response_model=TelemetryResponse)
async def get_telemetry(device_id: str):
    items = await get_db_telemetry(device_id)
    return {"data": items}


@router.get("/devices", response_model=list[str])
async def list_devices():
    response = await device_scan(
        table_name="Telemetry",
        project_expression="device_id",
        select="SPECIFIC_ATTRIBUTES",
    )
    device_ids = {item["device_id"] for item in response.get("Items", [])}
    return sorted(device_ids)
