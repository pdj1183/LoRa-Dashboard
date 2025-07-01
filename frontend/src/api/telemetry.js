export async function getDevices() {
    const res = await fetch('http://localhost:8001/devices');
    return res.json();
}

export async function getAllTelemetry() {
    const res = await fetch('http://localhost:8001/telemetry/all');
    const json = await res.json();
    return json.data || [];
}

export async function getAllTelemetryChart(start_date, end_date) {
    let url = 'http://localhost:8001/telemetry/chart/all';
    const params = [];
    if (start_date) params.push(`start_date=${start_date}`);
    if (end_date) params.push(`end_date=${end_date}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
}

export async function getTelemetry(device_id, start_date, end_date) {
    let url = `http://localhost:8001/telemetry?device_id=${device_id}`;
    if (start_date) url += `&start_date=${start_date}`;
    if (end_date) url += `&end_date=${end_date}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
}

