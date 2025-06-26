export async function getDevices() {
    const res = await fetch('http://localhost:8001/devices');
    return res.json();
}

export async function getAllTelemetry() {
    const res = await fetch('http://localhost:8001/telemetry/all');
    const json = await res.json();
    return json.data || [];
}

export async function getTelemetry(device_id) {
    const res = await fetch(`http://localhost:8001/telemetry?device_id=${device_id}`);
    const json = await res.json();
    return json.data || [];
}

