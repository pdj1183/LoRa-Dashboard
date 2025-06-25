from fastapi import APIRouter, WebSocket
from app.websocket_manager import connect, disconnect

ws_router = APIRouter()


@ws_router.websocket("/ws/telemetry/{device_id}")
async def telemetry_ws(ws: WebSocket, device_id: str):
    await connect(device_id, ws)
    try:
        while True:
            await ws.receive_text()  # keep connection open
    except Exception:
        pass
    finally:
        disconnect(device_id, ws)
