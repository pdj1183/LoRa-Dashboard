from fastapi import APIRouter
from app.dynamodb import get_db_telemetry, list_device_ids, get_all_telemetry
from app.models import TelemetryResponse

router = APIRouter()


@router.get("/telemetry", response_model=TelemetryResponse)
async def get_telemetry(device_id: str):
    items = await get_db_telemetry(device_id)
    return {"data": items}


@router.get("/telemetry/all")
def get_all():
    items = get_all_telemetry()
    return {"data": items}


@router.get("/devices", response_model=list[str])
async def list_devices():
    return list_device_ids()
