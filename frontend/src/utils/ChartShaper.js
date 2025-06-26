export default function shapeTelemetryForChart(grouped) {
  const merged = {};

  Object.entries(grouped).forEach(([deviceId, records]) => {
    records.forEach(({ timestamp, temperature }) => {
      const key = timestamp;

      if (!merged[key]) {
        merged[key] = { timestamp };
        merged[key].timeLabel = new Date(timestamp).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }

      merged[key][deviceId] = temperature;
    });
  });

  return Object.values(merged).sort((a, b) => a.timestamp - b.timestamp);
}

