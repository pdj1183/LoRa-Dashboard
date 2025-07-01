import React from "react";
import {
    AreaChart,
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Brush,
} from "recharts";
import { formatTime } from "../utils/format";
import { getDeviceColor } from "../utils/colors";

export function StackedTelemetryChart({ data, deviceIds }) {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} type="number" />
                <Legend />
                <Tooltip labelFormatter={formatTime} />
                {deviceIds.map((deviceId) => (
                    <Line
                        key={deviceId}
                        type="monotone"
                        dataKey={deviceId}
                        name={`Device ${deviceId}`}
                        stroke={getDeviceColor(deviceId, deviceIds)}
                        fill={getDeviceColor(deviceId, deviceIds)}
                        connectNulls
                        dot={true}
                        isAnimationActive={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}

export function SynchronizedCharts({ data, deviceIds }) {
    return (
        <div style={{ width: "100%" }}>
            {deviceIds.map((deviceId) => (
                <div key={deviceId} style={{ marginBottom: 24 }}>
                    <h4 className={getDeviceColor(deviceId, deviceIds)}>
                        {deviceId}
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                scale="time"
                                tickFormatter={(ts) =>
                                    new Date(ts).toLocaleTimeString()
                                }
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(ts) =>
                                    new Date(ts).toLocaleString()
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey={deviceId}
                                stroke={getDeviceColor(deviceId, deviceIds)}
                                fill={getDeviceColor(deviceId, deviceIds)}
                                connectNulls={true}
                                dot={true}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    );
}

export function TelemetryChart({ data, deviceId, deviceIds }) {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    domain={["auto", "auto"]}
                    type="number"
                    scale="time"
                />
                <YAxis />
                <Tooltip labelFormatter={formatTime} />
                <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke={getDeviceColor(deviceId, deviceIds)}
                    fill={getDeviceColor(deviceId, deviceIds)}
                    connectNulls
                    dot={true}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
