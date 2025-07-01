export function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

export function dateStringToMs(dateString, endOfDay = false) {
    if (!dateString) return null;

    // Parse as UTC instead of local time
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (endOfDay) {
        date.setUTCHours(23, 59, 59, 999);
    }

    return date.getTime();
}
