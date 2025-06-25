import asyncio
import json
import os
import signal
from gmqtt import Client as MQTTClient
from app.websocket_manager import broadcast_telemetry_to_ws
from app.dynamodb import save_telemetry

STOP = asyncio.Event()
MQTT_TOPIC = 'lora/devices/+/telemetry'
MQTT_BROKER = os.getenv("MQTT_BROKER", "mqtt")

client = MQTTClient("backend-sub")


def on_connect(client, flags, rc, properties):
    print("[mqtt_listener] Connected, subscribing to topic...", flush=True)
    client.subscribe(MQTT_TOPIC)
    print(f"[mqtt_listener] Subscribed to {MQTT_TOPIC}", flush=True)


def on_message(client, topic, payload, qos, properties):
    try:
        msg = json.loads(payload.decode())
        device_id = topic.split("/")[2]
        print(f"[mqtt_listener] Received telemetry from {device_id}: {msg}", flush=True)

        save_telemetry(device_id, msg)


        # Send to WebSocket clients (async context required)
        asyncio.create_task(broadcast_telemetry_to_ws(device_id, msg))

    except Exception as e:
        print(f"[mqtt_listener] Error processing message: {e}", flush=True)


def on_disconnect(client, packet, exc=None):
    print("[mqtt_listener] Disconnected")


def on_subscribe(client, mid, qos, properties):
    print("[mqtt_listener] Subscription acknowledged")


def ask_exit(*args):
    print("[mqtt_listener] Exit requested")
    STOP.set()


async def connect_and_loop():
    # Register signal handlers (good for standalone too)
    loop = asyncio.get_event_loop()
    loop.add_signal_handler(signal.SIGINT, ask_exit)
    loop.add_signal_handler(signal.SIGTERM, ask_exit)

    # Bind events
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    client.on_subscribe = on_subscribe

    print(f"[mqtt_listener] Connecting to broker: {MQTT_BROKER}", flush=True)
    await client.connect(MQTT_BROKER)  # port 1883 by default

    print("[mqtt_listener] MQTT_Listener event loop started", flush=True)
    await STOP.wait()

    await client.disconnect()

