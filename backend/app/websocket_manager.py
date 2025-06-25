from fastapi import WebSocket
from typing import Dict, List

active_connections: Dict[str, List[WebSocket]] = {}


async def connect(device_id: str, websocket: WebSocket):
    await websocket.accept()
    active_connections.setdefault(device_id, []).append(websocket)
    print(f"Connected to WebSocket", flush=True)


def disconnect(device_id: str, websocket: WebSocket):
    active_connections[device_id].remove(websocket)


async def broadcast_telemetry_to_ws(device_id: str, data: dict):
    print(f"Trying to broadcast to {device_id}", flush=True)
    print(f"Active device ids: {list(active_connections.keys())}", flush=True)

    if device_id in active_connections:
        connections = active_connections[device_id]
        print(f"Broadcasting to {len(connections)} clients for {device_id}", flush=True)
        for ws in connections:
            await ws.send_json(data)
    else:
        print(f"No active WebSocket connections for {device_id}", flush=True)
