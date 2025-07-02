# LoRa Dashboard – Frontend

This is the **frontend** for the LoRa Dashboard project. It provides a real-time, browser-based interface for visualizing telemetry data from ESP32 LoRa devices. Built with **React** and **Vite**, it supports both **historical analysis** and **live updates** via WebSockets.

---

## Features

-  **Live Chart**: Real-time telemetry updates via WebSocket
-  **Historical View**: REST API to select time windows
-  **Device Selector**: Choose which device(s) to view
-  **Responsive UI**: Styled with modern CSS and components

---

## Project Structure

```bash
frontend/
├── scripts/
│   ├── color-generator.mjs
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── api/
│   │   └── telemetry.js           # REST API requests
│   ├── components/
│   │   ├── Dashboard.jsx          # Main layout
│   │   ├── DateSelector.jsx       # Date selector for the date range of device data
│   │   ├── DeviceSelector.jsx     # Dropdown or tabs for device switching
│   │   ├── LiveStats.jsx          # Realtime stats display (e.g., log of last updates)
│   │   └── TelemetryChart.jsx     # Line chart of temperature over time
│   ├── hooks/
│   │   └── useTelemetrySocket.js  # WebSocket hook
│   ├── utils/
│   │   ├── colors-data.js              # Array of all colors for the devices
│   │   ├── format.js              # Time formatting, data shaping
│   │   └── colors.js              # Device color mapping
│   └── styles/
│       ├── globals.css            # Base styles
│       └── colors-generated.css   # Created by color-generator.mjs
├── index.html
├── package.json
```

## Local Development

Use the setup.sh to automate the startup.

To run manually:
##### 1. Install dependencies
```bash
cd frontend
npm install
```

##### 2. Run Dev Server
```bash
npm run dev
```
    The frontend will be available at http://localhost:5173

Make sure the backend is running at http://localhost:8001, or update the API base URL as needed.

## Simulated Example
To see real-time updates, publish a test message:
```bash
mosquitto_pub -h localhost -t "lora/devices/device123/telemetry" \
  -m '{"temperature": 28.5, "timestamp": 1720000000}'
```
You should see the dashboard update instantly.

