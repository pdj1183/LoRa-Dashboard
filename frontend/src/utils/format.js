export function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

export function dateStringToMs(dateString, endOfDay = false) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (endOfDay) {
        // Set to the end of day: 23:59:59.999
        date.setHours(23, 59, 59, 999);
    }
    return date.getTime();
}
