const DEVICES = [
    "B63E1D54B76D",
    "5D8DADF1DA9F",
    "0A9EBB0F3B32",
    "D7C8474C06CA",
    "FD0EBDA8D925",
];

export async function getDevices() {
    return new Promise(resolve => setTimeout(() => resolve(DEVICES), 100));
}

function generateFakeData(startMs, endMs, deviceId) {
    const data = [];
    const interval = 60 * 60 * 1000; // 1 hour
    const dayMs = 24 * 60 * 60 * 1000;
    for (let t = startMs; t <= endMs; t += interval) {
        // Daily temperature cycle: cooler at night, warmer during day
        const hourOfDay = (t % dayMs) / (60 * 60 * 1000);
        const baseTemp = 15 + 10 * Math.sin((hourOfDay - 6) / 24 * 2 * Math.PI); // Peak at 6 PM
        const noise = (Math.random() - 0.5) * 4; // +/- 2 degrees noise

        if (deviceId) {
            const deviceOffset = deviceId.charCodeAt(0) % 5 - 2; // Slight offset per device
            data.push({
                timestamp: t,
                temperature: Math.round((baseTemp + deviceOffset + noise) * 100) / 100
            });
        } else {
            const point = { timestamp: t };
            DEVICES.forEach(id => {
                const deviceOffset = id.charCodeAt(0) % 5 - 2;
                point[id] = Math.round((baseTemp + deviceOffset + (Math.random() - 0.5) * 4) * 100) / 100;
            });
            data.push(point);
        }
    }
    return data;
}

export async function getAllTelemetry() {
    const now = Date.now();
    const start = now - 24 * 60 * 60 * 1000; // last 24 hours
    return { data: generateFakeData(start, now, null) };
}

export async function getAllTelemetryChart(start_date, end_date) {
    return generateFakeData(start_date, end_date, null);
}

export async function getTelemetry(device_id, start_date, end_date) {
    return generateFakeData(start_date, end_date, device_id);
}