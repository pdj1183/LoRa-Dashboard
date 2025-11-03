import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import HamburgerMenu from "./components/HamburgerMenu";

export default function App() {
  const [demoMode, setDemoMode] = useState(true);
  const [apiUrl, setApiUrl] = useState("http://localhost:8001");

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center" }}>
      <div className="header">
        <h1>Hello, LoRa Dashboard!</h1>
        <HamburgerMenu 
          demoMode={demoMode} 
          setDemoMode={setDemoMode}
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
        />
      </div>
      <Dashboard demoMode={demoMode} apiUrl={apiUrl} />
    </div>
  );
}
