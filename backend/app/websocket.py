from fastapi import APIRouter, WebSocket
from app.websocket_manager import connect, disconnect
import asyncio

ws_router = APIRouter()

# @ws_router.websocket("/ws/telemetry/{device_id}")
# async def websocket_endpoint(websocket: WebSocket, device_id: str):
#     await websocket.accept()
#     while True:
#         await websocket.send_json({
#             "device_id": device_id,
#             "temperature": 28.0,
#             "timestamp": 123456789
#         })
#         await asyncio.sleep(5)

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
