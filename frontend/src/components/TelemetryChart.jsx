import React from 'react'
import {
    AreaChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { formatTime } from '../utils/format';


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00bcd4", "#a0d911"];
const getRandomColor = () =>
    COLORS[Math.floor(Math.random() * COLORS.length)];

export default function StackedTelemetryChart({ data, deviceIds }) {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeLabel" />
                <YAxis />
                <Tooltip />
                {deviceIds.map((deviceId, idx) => (
                    <Area
                        key={deviceId}
                        type="monotone"
                        dataKey={deviceId}
                        name={`Device ${deviceId}`}
                        stackId="1"
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function TelemetryChart({ data }) {
    const color = getRandomColor()
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    domain={['auto', 'auto']}
                    type="number"
                />
                <YAxis />
                <Tooltip labelFormatter={formatTime} />
                <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke={color}
                    fill={color}
                    dot={false}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

