
export const generatePastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash >> 16) & 0xFF;
    const g = (hash >> 8) & 0xFF;
    const b = hash & 0xFF;
    return `rgba(${(r % 127) + 127}, ${(g % 127) + 127}, ${(b % 127) + 127}, 1)`;
};
