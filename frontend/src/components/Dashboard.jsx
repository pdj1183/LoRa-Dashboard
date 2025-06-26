import React, { useEffect, useState, useCallback } from 'react';
import { getDevices, getTelemetry, getAllTelemetry } from '../api/telemetry';
import useTelemetrySocket from '../hooks/useTelemetrySocket';
import DeviceSelector from './DeviceSelector';
import StackedTelemetryChart, { TelemetryChart } from "./TelemetryChart.jsx"
import LiveStats from './LiveStats';
import shapeTelemetryForChart from '../utils/ChartShaper.js';

export default function Dashboard() {
    const [deviceId, setDeviceId] = useState('');
    const [devices, setDevices] = useState([]);
    const [data, setData] = useState([]);
    const [shapedData, setShapedData] = useState([]);
    const [wsDevice, setWSDevice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch list of devices
    useEffect(() => {
        getDevices().then(setDevices);
    }, []);

    // Fetch historical data 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = deviceId
                    ? await getTelemetry(deviceId)
                    : shapeTelemetryForChart(await getAllTelemetry());
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deviceId]);


    // Handle incoming WebSocket messages (live telemetry)

    const handleMessage = useCallback((telemetry) => {
        setData((prev) => {
            if (deviceId) {
                return [...prev, telemetry];
            } else {
                // TODO: All Data addition
            }
        });
    }, [deviceId]); // depends only on `deviceId`

    useTelemetrySocket(deviceId, handleMessage);


    return (
        <div>
            <DeviceSelector
                devices={devices}
                value={deviceId}
                onChange={setDeviceId}
            />
            <>
                {deviceId
                    ? <TelemetryChart data={data} deviceId={deviceId} classname="chart-container" />
                    : <StackedTelemetryChart data={data} deviceIds={devices} classname="chart-container" />
                }
            </>
        </div>
    );
}

