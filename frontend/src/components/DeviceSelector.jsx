import React from 'react';

export default function DeviceSelector({ devices, value, onChange }) {
    return (
        <div>
            <label>Select device: </label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">-- All Devices --</option>
                {devices.map((id) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                ))}
            </select>
        </div>
    );
}

