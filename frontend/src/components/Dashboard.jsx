import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getDevices,
  getTelemetry,
  getAllTelemetry,
  getAllTelemetryChart,
} from "../api/telemetry";
import {
  getDevices as getMockDevices,
  getTelemetry as getMockTelemetry,
  getAllTelemetry as getMockAllTelemetry,
  getAllTelemetryChart as getMockAllTelemetryChart,
} from "../api/mockTelemetry";
import useTelemetrySocket from "../hooks/useTelemetrySocket";
import DeviceSelector from "./DeviceSelector";
import {
  StackedTelemetryChart,
  SynchronizedCharts,
  TelemetryChart,
} from "./TelemetryChart.jsx";
import LiveStats, { LiveDataContext } from "./LiveStats";
import { COLORS } from "../utils/colors-data.js";
import { dateStringToMs } from "../utils/format.js";
import DateSelector from "./DateSelector.jsx";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}
function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function Dashboard({ demoMode, apiUrl }) {
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [colorMap, setColorMap] = useState({});
  const [startDate, setStartDate] = useState(getYesterdayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [liveDataLog, setLiveDataLog] = useState([]);
  const addLiveData = (msg) => setLiveDataLog((prev) => [...prev, msg]);

  useEffect(() => {
    (demoMode ? getMockDevices() : getDevices(apiUrl)).then(setDevices);
  }, [demoMode, apiUrl]);

  useEffect(() => {
    const fetchColors = async () => {
      if (devices.length > 0) {
        const map = {};
        devices.forEach((id, i) => {
          map[id] = COLORS[i % COLORS.length];
        });
        setColorMap(map);
      }
      fetchColors();
      console.log(colorMap);
    };
  }, [devices]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startMs = dateStringToMs(startDate);
        const endMs = dateStringToMs(endDate, true);
        const result = demoMode
          ? deviceId
            ? await getMockTelemetry(deviceId, startMs, endMs)
            : await getMockAllTelemetryChart(startMs, endMs)
          : deviceId
            ? await getTelemetry(deviceId, startMs, endMs, apiUrl)
            : await getAllTelemetryChart(startMs, endMs, apiUrl);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, startDate, endDate, demoMode, apiUrl]);

  // Handle incoming WebSocket messages (live telemetry)
  const dataRef = useRef();
  dataRef.current = data;

  const handleMessageRef = useRef();
  handleMessageRef.current = (telemetry) => {
    setData((prev) => {
      if (deviceId) {
        const updated = [...prev, telemetry];
        return updated;
      } else {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && telemetry.timestamp === last.timestamp) {
          // Update value for this device only
          updated[updated.length - 1] = {
            ...last,
            [telemetry.device_id]: telemetry.temperature,
          };
          // Ensure all device keys exist
          devices.forEach((id) => {
            if (!(id in updated[updated.length - 1])) {
              updated[updated.length - 1][id] = null;
            }
          });
          return updated;
        } else {
          // New timestamp row
          // Ensure all device keys exist
          const newPoint = { timestamp: telemetry.timestamp };
          devices.forEach((id) => {
            newPoint[id] =
              id === telemetry.device_id ? telemetry.temperature : null;
          });
          return [...prev, newPoint];
        }
      }
    });
    addLiveData(JSON.stringify(telemetry));
  };

  // Stable wrapper for useTelemetrySocket:
  const stableHandleMessage = useCallback(
    (telemetry) => handleMessageRef.current(telemetry),
    [],
  );

  useTelemetrySocket(deviceId, stableHandleMessage, demoMode, apiUrl);

  return (
    <div className="dashboard">
      {demoMode && (
        <label title="Demo Mode simulates live device data for testing purposes when no real devices are connected">
          <div className="demo-indicator">
            <div className="dot"></div>
            Demo Mode Active
          </div>
        </label>
      )}
      <DeviceSelector
        devices={devices}
        value={deviceId}
        onChange={setDeviceId}
      />
      <DateSelector
        startValue={startDate}
        startOnChange={setStartDate}
        endValue={endDate}
        endOnChange={setEndDate}
      />
      <div className="dataView">
        <div className="chart-container">
          {deviceId ? (
            <TelemetryChart
              data={data}
              deviceId={deviceId}
              deviceIds={devices}
            />
          ) : (
            <StackedTelemetryChart data={data} deviceIds={devices} />
          )}
        </div>
        <div>
          <LiveDataContext.Provider value={liveDataLog}>
            <LiveStats devices={devices} />
          </LiveDataContext.Provider>
        </div>
      </div>
    </div>
  );
}
