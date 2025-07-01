import React from "react";
import { getDeviceColor } from "../utils/colors";

export default function DeviceSelector({ devices, value, onChange }) {
    return (
        <div>
            <label>Select device: </label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">-- All Devices --</option>
                {devices.map((id) => (
                    <option key={id} value={id} style={{color: getDeviceColor(id, devices)}}>
                        {id}
                    </option>
                ))}
            </select>
        </div>
    );
}
