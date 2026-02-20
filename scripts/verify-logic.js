const XLSX = require('xlsx');

// Mock data and functions from payment-actions.ts logic
function normalizeString(str) {
    return str ? str.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}

function findColumn(row, candidates) {
    const rowKeys = Object.keys(row);
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase().replace(/\s+/g, ' ');
        const found = rowKeys.find(k => k.trim().toLowerCase().replace(/[\r\n\s]+/g, ' ') === nc);
        if (found) return found;
    }
    for (const candidate of candidates) {
        const nc = candidate.trim().toLowerCase();
        const found = rowKeys.find(k => k.toLowerCase().replace(/[\r\n]+/g, ' ').trim().includes(nc));
        if (found) return found;
    }
    return undefined;
}

// Test cases for matching
const mockPlayers = [
    { id: '1', firstName: 'Damian', lastName: 'Golzman', dni: '12345678', partnerNumber: '1001', status: 'ACTIVO' },
    { id: '2', firstName: 'Juan', lastName: 'Perez', dni: '87654321', partnerNumber: '1002', status: 'REVISAR' },
];

const testRows = [
    { documento: '12345678', apellido: 'Golzman', nombre: 'Damian', year: '2026', cuotas: 'SALDADO' },
    { nrosocio: '1002', apellido: 'Perez', nombre: 'Juan', year: '2026', cuotas: '1' },
    { apellido: 'GOLZMAN', nombre: 'DAMIAN', year: '2026', cuotas: '2' },
    { documento: '99999999', apellido: 'Inexistente', nombre: 'Alguien', year: '2026', cuotas: '1' },
    { dni: '12345678', anio: '2027', installments: '3' }
];

console.log('--- TEST: Excel Column Detection & Player Matching ---');

testRows.forEach((row, index) => {
    const dniKey = findColumn(row, ['dni', 'documento']);
    const socioKey = findColumn(row, ['nrosocio', 'socio']);
    const apellidoKey = findColumn(row, ['apellido']);
    const nombreKey = findColumn(row, ['nombre']);

    const dni = dniKey ? row[dniKey].toString().trim() : undefined;
    const socio = socioKey ? row[socioKey]?.toString().trim() : undefined;
    const apellido = apellidoKey ? normalizeString(row[apellidoKey]) : '';
    const nombre = nombreKey ? normalizeString(row[nombreKey]) : '';

    let match, method;
    if (dni && dni.length > 4) {
        match = mockPlayers.find(p => p.dni === dni);
        if (match) method = 'DNI';
    }
    if (!match && socio) {
        match = mockPlayers.find(p => p.partnerNumber === socio);
        if (match) method = 'PARTNER_NUMBER';
    }
    if (!match && nombre && apellido) {
        match = mockPlayers.find(p =>
            normalizeString(p.firstName) === nombre &&
            normalizeString(p.lastName) === apellido
        );
        if (match) method = 'NAME_FUZZY';
    }

    if (match) {
        console.log(`[FILA ${index + 1}] ✅ MATCHED by ${method}: ${match.firstName} ${match.lastName} (${match.status})`);
    } else {
        console.log(`[FILA ${index + 1}] ❌ UNMATCHED`);
    }
});

// FederationBadge logic mock
function getFederationBadge(year, installments) {
    if (!year && !installments) {
        return "❌ Sin registro";
    }
    if (installments === 'SALDADO') {
        return `✓ ${year} — SALDADO`;
    }
    const suffix = (installments && parseInt(installments) > 1) ? 's' : '';
    return `🏅 ${year} — ${installments} cuota${suffix}`;
}

// Reporting alert logic mock
function getStatus(scholarship, lastSocial, lastActivity, currentYM) {
    const socialOk = lastSocial && parseInt(lastSocial) >= currentYM;
    const activityOk = scholarship || (lastActivity && parseInt(lastActivity) >= currentYM);

    if (socialOk && activityOk) return 'AL_DIA';
    if (!socialOk && !activityOk) return 'DEUDA_TOTAL';
    if (!socialOk) return 'DEUDA_SOCIAL';
    return 'DEUDA_ACTIVIDAD';
}

console.log('\n--- TEST: FederationBadge Logic ---');
console.log(getFederationBadge(null, null));
console.log(getFederationBadge(2026, 'SALDADO'));
console.log(getFederationBadge(2026, '1'));
console.log(getFederationBadge(2026, '2'));

console.log('\n--- TEST: Reporting Alert Logic (Scholarship handling) ---');
const currentYM = 202602;
const reportTests = [
    { name: 'Normal Al día', scholarship: false, lastSocial: '202602', lastActivity: '202602' },
    { name: 'Deuda Social', scholarship: false, lastSocial: '202601', lastActivity: '202602' },
    { name: 'Deuda Actividad (No becado)', scholarship: false, lastSocial: '202602', lastActivity: '202601' },
    { name: 'Becado con Deuda Social', scholarship: true, lastSocial: '202601', lastActivity: '202601' },
    { name: 'Becado Al día (Actividad ignorada)', scholarship: true, lastSocial: '202602', lastActivity: '202101' },
];

reportTests.forEach(t => {
    const status = getStatus(t.scholarship, t.lastSocial, t.lastActivity, currentYM);
    console.log(`${t.name.padEnd(35)} -> ${status}`);
});
