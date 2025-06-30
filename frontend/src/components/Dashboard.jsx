import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getDevices, getTelemetry, getAllTelemetry, getAllTelemetryChart } from '../api/telemetry';
import useTelemetrySocket from '../hooks/useTelemetrySocket';
import DeviceSelector from './DeviceSelector';
import { SynchronizedCharts, TelemetryChart } from "./TelemetryChart.jsx"
import LiveStats from './LiveStats';
import { COLORS } from '../utils/colors.js';
import { dateStringToMs } from '../utils/format.js';

function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
}
function getWeekAgoDateString() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
    const [deviceId, setDeviceId] = useState('');
    const [devices, setDevices] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [colorMap, setColorMap] = useState({});
    const [startDate, setStartDate] = useState(getWeekAgoDateString());
    const [endDate, setEndDate] = useState(getTodayDateString());

    // Fetch list of devices
    useEffect(() => {
        getDevices().then(setDevices);
    }, []);

    useEffect(() => {
        const fetchColors = async () => {
            if (devices.length > 0) {
                const map = {};
                devices.forEach((id, i) => {
                    map[id] = COLORS[i % COLORS.length];
                });
                setColorMap(map);
            };
            fetchColors();
            console.log(colorMap)
        }
    }, [devices]);


    // Fetch historical data 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const startMs = dateStringToMs(startDate);
                const endMs = dateStringToMs(endDate, true);
                const result = deviceId
                    ? await getTelemetry(deviceId, startMs, endMs)
                    : await getAllTelemetryChart(startMs, endMs);
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deviceId, startDate, endDate]);


    // Handle incoming WebSocket messages (live telemetry)
    const dataRef = useRef();
    dataRef.current = data;

    const handleMessageRef = useRef();
    handleMessageRef.current = (telemetry) => {
        console.log("Handle Message")
        setData(prev => {
            if (deviceId) {
                return [...prev, telemetry];
            } else {
                console.log("UPDATE")
                const last = prev[prev.length - 1];
                if (last && telemetry.timestamp === last.timestamp) {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...last,
                        [telemetry.device_id]: telemetry.temperature,
                    };
                    return updated;
                } else {
                    console.log("APPEND")
                    const updated = [
                        ...prev,
                        {
                            timestamp: telemetry.timestamp,
                            [telemetry.device_id]: telemetry.temperature,
                        }
                    ];
                    return updated;
                }
            }
        });
    };

    // Stable wrapper for useTelemetrySocket:
    const stableHandleMessage = useCallback(
        (telemetry) => handleMessageRef.current(telemetry),
        []
    );

    useTelemetrySocket(deviceId, stableHandleMessage);


    return (
        <div>
            <DeviceSelector
                devices={devices}
                value={deviceId}
                onChange={setDeviceId}
            />
            <div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Start Date:
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </label>
                    <label style={{ marginLeft: 8 }}>
                        End Date:
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </label>
                </div>
            </div>
            <>
                {deviceId
                    ? <TelemetryChart data={data} deviceId={deviceId} deviceIds={devices} classname="chart-container" />
                    : <SynchronizedCharts data={data} deviceIds={devices} />

                }
            </>
        </div>
    );
}

