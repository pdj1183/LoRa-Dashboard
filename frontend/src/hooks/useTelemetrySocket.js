import { useEffect, useRef } from 'react';

export default function useTelemetrySocket(deviceId, onMessage) {
    const wsRef = useRef(null);

    useEffect(() => {
        const path = deviceId || 'all';
        const ws = new WebSocket(`ws://localhost:8001/ws/telemetry/${path}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected:", ws.url);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);  // this should now be stable due to `useCallback`
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
    }, [deviceId, onMessage]); // useCallback makes `onMessage` stable!

}

