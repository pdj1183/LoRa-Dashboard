from fastapi import WebSocket
from typing import Dict, List

active_connections: Dict[str, List[WebSocket]] = {}


async def connect(device_id: str, websocket: WebSocket):
    await websocket.accept()
    active_connections.setdefault(device_id, []).append(websocket)
    print(f"[WebSocket] Connected to {device_id}", flush=True)


def disconnect(device_id: str, websocket: WebSocket):
    if device_id in active_connections:
        active_connections[device_id].remove(websocket)
        print(f"[WebSocket] Disconnected from {device_id}", flush=True)
        if not active_connections[device_id]:
            del active_connections[device_id]


async def broadcast_telemetry_to_ws(device_id: str, data: dict):
    print(
        f"[WebSocket] Broadcasting telemetry for  \
            {device_id}",
        flush=True,
    )
    print(
        f"[WebSocket] Active device IDs:    \
                {list(active_connections.keys())}",
        flush=True,
    )

    if device_id in active_connections:
        for ws in active_connections[device_id]:
            await ws.send_json(data)

    if "all" in active_connections:
        data_with_id = {"device_id": device_id, **data}
        for ws in active_connections["all"]:
            await ws.send_json(data_with_id)
