import React, { useState, createContext, useContext } from 'react';

export const LiveDataContext = createContext();

export default function LiveStats() {
    const dataLog = useContext(LiveDataContext);
    return (
        <div>
            {dataLog.map((msg, idx) => (
                <h1 key={idx}>{msg}</h1>
            ))}
        </div>
    );
}
