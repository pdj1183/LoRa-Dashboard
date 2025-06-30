from collections import defaultdict


def format_data(data):
    grouped = defaultdict(dict)
    for item in data:
        timestamp = int(item["timestamp"])
        temperature = float(item["temperature"])
        device_id = item["device_id"]
        grouped[timestamp]["timestamp"] = timestamp
        grouped[timestamp][device_id] = temperature
    return grouped
