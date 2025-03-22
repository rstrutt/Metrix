
export const generatePastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash >> 16) & 0xFF;
    const g = (hash >> 8) & 0xFF;
    const b = hash & 0xFF;

    // Blend with white to make the color more muted
    const blendFactor = 0.7; // Adjust this value to control the level of muting
    const mutedR = Math.round((r % 127 + 127) * blendFactor + 255 * (1 - blendFactor));
    const mutedG = Math.round((g % 127 + 127) * blendFactor + 255 * (1 - blendFactor));
    const mutedB = Math.round((b % 127 + 127) * blendFactor + 255 * (1 - blendFactor));

    return `rgba(${mutedR}, ${mutedG}, ${mutedB}, 1)`;
};
