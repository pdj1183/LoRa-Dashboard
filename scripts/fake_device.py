import argparse
import json
import random
import time
import threading
from datetime import datetime
import paho.mqtt.publish as publish
import socket

BROKER = "localhost"
BASE_TOPIC = "lora/devices/{device_id}/telemetry"

fixed_device_ids = [
    "B63E1D54B76D",
    "5D8DADF1DA9F",
    "0A9EBB0F3B32",
    "D7C8474C06CA",
    "FD0EBDA8D925",
]


def random_device_id():
    return "".join(random.choices("0123456789ABCDEF", k=12))


def run_fake_device(device_id: str, interval: float):
    uptime_ms = 0
    while True:
        try:
            temperature = round(random.uniform(22.0, 30.0), 2)
            timestamp = int(time.time() * 1000)
            uptime_ms += int(interval * 1000)

            payload = {
                "device_id": device_id,
                "temperature": temperature,
                "uptime_ms": uptime_ms,
                "timestamp": timestamp,
            }

            topic = BASE_TOPIC.format(device_id=device_id)

            publish.single(topic=topic, payload=json.dumps(payload), hostname=BROKER)
            print(f"[{datetime.utcnow()}] {device_id} -> MQTT: {payload}")
            time.sleep(interval)

        except (ConnectionRefusedError, socket.gaierror, OSError) as e:
            print(f"[{device_id}] MQTT publish failed: {e}. Retrying in {interval}s...")
            time.sleep(interval)

        except Exception as e:
            print(f"[{device_id}] Unexpected error: {e}")
            time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description="Fake LoRa MQTT device simulator")
    parser.add_argument(
        "--count", type=int, default=1, help="Number of devices to simulate"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Interval between messages (in seconds) per device",
    )
    args = parser.parse_args()

    print(f"Starting {args.count} fake devices, publishing every {args.interval}s...\n")

    threads = []
    for i in range(args.count):
        if i < len(fixed_device_ids):
            device_id = fixed_device_ids[i]
        else:
            device_id = random_device_id()
        t = threading.Thread(
            target=run_fake_device, args=(device_id, args.interval), daemon=True
        )
        t.start()
        threads.append(t)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nSimulation interrupted by user. Exiting.")


if __name__ == "__main__":
    main()
