from fastapi import APIRouter
from app.dynamodb import get_telemetry_items

router = APIRouter()

@router.get("/telemetry")
async def get_telemetry(device_id: str, start: int, end: int):
    items = await get_telemetry_items(device_id, start, end)
    return {"data": items}

