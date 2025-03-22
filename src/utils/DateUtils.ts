

export function timestampToDateTimeString(timestamp: number) {
    const date = new Date(timestamp); // Multiply by 1000 to convert seconds to milliseconds

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function timestampToDateString(timestamp: number) {
    const date = new Date(timestamp); // Multiply by 1000 to convert seconds to milliseconds

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function timestampToMonthYear(timestamp: number) {
    const date = new Date(timestamp); // Multiply by 1000 to convert seconds to milliseconds

    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);

    return `${month} '${year}`;

}

