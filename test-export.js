const { getCategory } = require('./src/lib/utils');

function evaluatePlayerStatus_sim(currentStatus, dni, birthDate) {
    if (currentStatus !== 'REVISAR') return currentStatus;
    if (!dni || dni.startsWith('TEMP-')) return 'REVISAR';
    if (!birthDate) return 'REVISAR';
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return 'REVISAR';
    const year = date.getFullYear();
    if (year <= 1970 || year === 1900) return 'REVISAR';
    return 'ACTIVO';
}

function mockExport(player) {
    const mappings = []; // any
    const calculatedCategory = getCategory(player, mappings);

    const year = player.birthDate instanceof Date ? player.birthDate.getFullYear() : new Date(player.birthDate).getFullYear();
    const isInvalidDate = year <= 1970 || year === 1900;
    const isTempDni = player.dni.startsWith('TEMP-');

    const auditNotes = [];
    if (isInvalidDate) auditNotes.push('FALTA NACIMIENTO');
    if (isTempDni) auditNotes.push('DNI TEMPORAL');
    if (!player.phone && !player.email) auditNotes.push('SIN CONTACTO');

    return {
        'Apellido': player.lastName,
        'Nombre': player.firstName,
        'DNI': isTempDni ? 'SIN DNI' : player.dni,
        'Fecha Nacimiento': isInvalidDate ? 'SIN FECHA' : (player.birthDate instanceof Date ? player.birthDate.toLocaleDateString('es-AR') : new Date(player.birthDate).toLocaleDateString('es-AR')),
        'Categoría': calculatedCategory,
        'Auditoría': auditNotes.join(' | ') || 'OK',
    };
}

const players = [
    {
        "firstName": "JOAQUIN",
        "lastName": "BERON",
        "dni": "TEMP-1771504224441-193",
        "birthDate": "1970-01-01T00:00:00.000Z",
        "status": "REVISAR"
    },
    {
        "firstName": "PEREZ",
        "lastName": "SEBASTIAN",
        "dni": "TEMP-1771504224458-198",
        "birthDate": "1970-01-01T00:00:00.000Z",
        "status": "REVISAR"
    }
];

try {
    players.forEach(p => {
        console.log(`Exporting ${p.firstName} ${p.lastName}...`);
        const result = mockExport(p);
        console.log('Result:', result);
    });
} catch (e) {
    console.error('ERROR in mockExport:', e);
}
