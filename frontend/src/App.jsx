import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navigation'

const pages = ["Dashboard", "Config"]

function mainConent(currentTab) {
    switch (currentTab) {
        case "Dashboard":
            return (<Dashboard />);
        case "Config":
            return (<div>CONFIG</div>)
        default:
            return (<Dashboard />);
    }
}

export default function App() {
    const [currentTab, setTab] = useState(pages[0])



    return (
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1>LoRa Dashboard</h1>
            <Navbar currentTab={currentTab} setTab={setTab} pages={pages} />
            {mainConent(currentTab)}
        </div>
    )
}

