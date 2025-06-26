import React from 'react';
import { formatTime } from '../utils/format';

export default function LiveStats({ latest }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2>Live Reading</h2>
      <p>Temperature: {latest.temperature}°C</p>
      <p>Uptime: {latest.uptime_ms} ms</p>
      <p>Time: {formatTime(latest.timestamp)}</p>
    </div>
  );
}

