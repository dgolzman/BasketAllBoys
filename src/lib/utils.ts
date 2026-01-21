export function getCategory(player: any, mappings?: { category: string, minYear: number, maxYear: number }[]): string {
    // 1. Manual override priority
    if (player.category) return player.category;

    // 2. BirthDate logic
    if (!player.birthDate) return "Desconocida";

    const date = new Date(player.birthDate);
    if (isNaN(date.getTime())) return "Desconocida";

    const year = date.getFullYear();

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
