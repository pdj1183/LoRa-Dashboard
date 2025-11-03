import { useEffect, useRef } from 'react';

const DEVICES = [
    "B63E1D54B76D",
    "5D8DADF1DA9F",
    "0A9EBB0F3B32",
    "D7C8474C06CA",
    "FD0EBDA8D925",
];

export default function useTelemetrySocket(deviceId, onMessage, demo = false, baseUrl = 'http://localhost:8001') {
    const wsRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (demo) {
            intervalRef.current = setInterval(() => {
                const device = deviceId || DEVICES[Math.floor(Math.random() * DEVICES.length)];
                const hourOfDay = (Date.now() % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000);
                const baseTemp = 15 + 10 * Math.sin((hourOfDay - 6) / 24 * 2 * Math.PI);
                const deviceOffset = device.charCodeAt(0) % 5 - 2;
                const noise = (Math.random() - 0.5) * 4;
                const fakeData = {
                    device_id: device,
                    temperature: Math.round((baseTemp + deviceOffset + noise) * 100) / 100,
                    timestamp: Date.now()
                };
                onMessage(fakeData);
            }, 2000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else {
            const path = deviceId || 'all';
            const wsUrl = baseUrl.replace(/^http/, 'ws');
            const ws = new WebSocket(`${wsUrl}/ws/telemetry/${path}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected:", ws.url);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (err) {
                    console.error("Error parsing telemetry data:", err);
                }
            };

            ws.onerror = (e) => {
                console.error("WebSocket error:", e);
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
            };

            return () => {
                console.log("Closing WebSocket:", ws.url);
                ws.close();
            };
        }
    }, [deviceId, onMessage, demo, baseUrl]);
}

