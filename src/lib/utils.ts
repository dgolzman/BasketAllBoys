export function getCategory(player: any, mappings?: { category: string, minYear: number, maxYear: number }[]): string {
    // 1. Manual override priority
    if (player.category) return player.category;

    // 2. BirthDate logic
    if (!player.birthDate) return "REVISAR";

    const date = new Date(player.birthDate);
    if (isNaN(date.getTime()) || date.getTime() <= 0) return "REVISAR";

    const year = date.getFullYear();
    if (year <= 1970) return "REVISAR";

    if (mappings && mappings.length > 0) {
        const found = mappings.find(m => year >= m.minYear && year <= m.maxYear);
        if (found) return found.category;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const age = currentYear - year;

    if (age < 9) return "Mosquitos";
    if (age <= 10) return "Pre-Mini";
    if (age <= 12) return "Mini";
    if (age <= 13) return "U13";
    if (age <= 15) return "U15";
    if (age <= 17) return "U17";
    if (age <= 19) return "U19";
    return "Primera";
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

/**
 * Re-evaluates player status. 
 * If status is REVISAR and all critical data is now present and real,
 * it returns ACTIVO. Otherwise returns the existing status.
 */
export function evaluatePlayerStatus(currentStatus: string, dni: string, birthDate: Date | null | string): string {
    if (currentStatus !== 'REVISAR') return currentStatus;

    if (!dni || dni.startsWith('TEMP-')) return 'REVISAR';

    if (!birthDate) return 'REVISAR';
    const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (isNaN(date.getTime())) return 'REVISAR';

    const year = date.getFullYear();
    // Default/Legacy invalid years
    if (year <= 1970 || year === 1900) return 'REVISAR';

    // If we are here, data is real and complete. Auto-promote to ACTIVO.
    return 'ACTIVO';
}
