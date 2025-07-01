import { COLORS } from "./colors-data";

export function getDeviceColor(deviceId, deviceIds) {
    const index = deviceIds.indexOf(deviceId);
    return COLORS[index % COLORS.length];
}

