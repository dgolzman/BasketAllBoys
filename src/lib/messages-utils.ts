export type VariableType = 'texto' | 'categoria' | 'horario' | 'lugar' | 'camiseta';

export interface TemplateVariable {
    name: string;
    type: VariableType;
}

// Parse variables field: supports both legacy CSV and new JSON format
export function parseVariables(raw: string): TemplateVariable[] {
    if (!raw || raw === '[]' || raw === '') return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((v: any) =>
                typeof v === 'string'
                    ? { name: v.trim(), type: 'texto' as VariableType }
                    : { name: v.name || '', type: (v.type as VariableType) || 'texto' }
            ).filter(v => v.name);
        }
    } catch {
        // Legacy: comma-separated string
        return raw.split(',').map(v => ({ name: v.trim(), type: 'texto' as VariableType })).filter(v => v.name);
    }
    return [];
}

export function serializeVariables(vars: TemplateVariable[]): string {
    return JSON.stringify(vars);
}
