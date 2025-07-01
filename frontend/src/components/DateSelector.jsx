import React from "react";

export default function DateSelector({ startOnChange, endOnChange, startValue, endValue }) {
    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Start Date:
                    <input
                        type="date"
                        value={startValue}
                        onChange={(e) => {
                            startOnChange(e.target.value);
                        }}
                    />
                </label>
                <label style={{ marginLeft: 8 }}>
                    End Date:
                    <input
                        type="date"
                        value={endValue}
                        onChange={(e) => {
                            endOnChange(e.target.value);
                        }}
                    />
                </label>
            </div>
        </div>
    );
}
