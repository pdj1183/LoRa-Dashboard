export const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00bcd4", "#a0d911", "#086788", "#07A0C3", "#F0C808", "#DD1C1A"];
export function getDeviceColor(deviceId, deviceIds) {
    const index = deviceIds.indexOf(deviceId);
    return COLORS[index % COLORS.length];
};


