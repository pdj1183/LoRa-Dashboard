export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

