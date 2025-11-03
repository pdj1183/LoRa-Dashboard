export async function getDevices(baseUrl = 'http://localhost:8001') {
    const res = await fetch(`${baseUrl}/devices`);
    return res.json();
}

export async function getAllTelemetry(baseUrl = 'http://localhost:8001') {
    const res = await fetch(`${baseUrl}/telemetry/all`);
    const json = await res.json();
    return json.data || [];
}

export async function getAllTelemetryChart(start_date, end_date, baseUrl = 'http://localhost:8001') {
    let url = `${baseUrl}/telemetry/chart/all`;
    const params = [];
    if (start_date) params.push(`start_date=${start_date}`);
    if (end_date) params.push(`end_date=${end_date}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
}

export async function getTelemetry(device_id, start_date, end_date, baseUrl = 'http://localhost:8001') {
    let url = `${baseUrl}/telemetry?device_id=${device_id}`;
    if (start_date) url += `&start_date=${start_date}`;
    if (end_date) url += `&end_date=${end_date}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
}

