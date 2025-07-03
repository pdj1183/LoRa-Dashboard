from pydantic import BaseModel
from typing import List


class TelemetryData(BaseModel):
    temperature: float
    device_id: str
    uptime_ms: int
    timestamp: int  # or float if using ms


class TelemetryResponse(BaseModel):
    data: List[TelemetryData]
