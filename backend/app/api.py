from fastapi import APIRouter
from app.dynamodb import get_db_telemetry
router = APIRouter()

@router.get("/telemetry")
async def get_telemetry(device_id: str):
    items = await get_db_telemetry(device_id)
    return {"data": items}

