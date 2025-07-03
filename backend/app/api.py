from fastapi import APIRouter, Query
from typing import Optional
from app.dynamodb import (
    get_db_telemetry,
    list_device_ids,
    get_all_telemetry,
    get_all_telemetry_chart,
)
from app.models import TelemetryResponse

router = APIRouter()


@router.get("/telemetry", response_model=TelemetryResponse)
async def get_telemetry(
    device_id: str,
    start_date: Optional[int] = Query(
        None,
        description="\
            Start timestamp (ms)",
    ),
    end_date: Optional[int] = Query(
        None,
        description="\
            End timestamp (ms)",
    ),
):
    items = await get_db_telemetry(device_id, start_date, end_date)
    return {"data": items}


@router.get("/telemetry/chart/all")
def get_all_chart(
    start_date: Optional[int] = Query(
        None,
        description="\
            Start timestamp (ms)",
    ),
    end_date: Optional[int] = Query(
        None,
        description="\
            End timestamp (ms)",
    ),
):
    items = get_all_telemetry_chart(start_date, end_date)
    return {"data": items}


@router.get("/telemetry/all")
def get_all():
    items = get_all_telemetry()
    return {"data": items}


@router.get("/devices", response_model=list[str])
async def list_devices():
    return list_device_ids()
