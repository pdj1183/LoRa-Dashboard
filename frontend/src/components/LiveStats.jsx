import React, { useState, createContext, useContext } from "react";
import { formatTime } from "../utils/format";
import { getDeviceColor } from "../utils/colors";

export const LiveDataContext = createContext();

export default function LiveStats(props) {
    const dataLog = useContext(LiveDataContext);
    return (
        <div className="liveStats">
            <h4> Live Stats </h4>
            <div className="statBox">
                <div id="anchor">
                    {dataLog.map((msg, idx) => (
                        <StatLine key={idx} data={msg} devices={props.devices} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Example Message
// {"device_id":"FAKE_DEVICE_5","temperature":27.07,"uptime_ms":11000,"timestamp":1751243351590}
function StatLine(props) {
    const parsed = JSON.parse(props.data);
    const device = (
        <p className={"colors-" + getDeviceColor(parsed.device_id, props.devices).replace("#", "").toLowerCase()}>
            {parsed.device_id}
        </p>
    )
    return (
        <div className="statline">
            <div className="deviceLine"> Device: {device}</div>
            Temperature: {parsed.temperature} at {formatTime(parsed.timestamp)}
        </div>
    );
}
