import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getCategory } from './utils';

/**
 * Exports data to an Excel file (.xlsx)
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Optional name for the sheet (default: 'Datos')
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Datos') {
    try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Create Blob
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        // Trigger download
        saveAs(dataBlob, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error al generar el archivo Excel.');
    }
}

/**
 * Client-side export function for use in components
 * @param players - Array of players to export
 * @param mappings - Category mappings for calculating category
 */
export function exportPlayersToExcel(players: any[], mappings: any[]) {
    const exportData = players.map(player => {
        const calculatedCategory = getCategory(player, mappings);

        // Audit logic for Excel
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
            'Tira': player.tira,
            'Auditoría': auditNotes.join(' | ') || 'OK',
            'Socio': player.partnerNumber || '',
            'Camiseta': player.shirtNumber || '',
            'Teléfono': player.phone || '',
            'Email': player.email || '',
            'Estado': player.status,
            'Beca': player.scholarship ? 'Sí' : 'No',
            'Juega Primera': player.playsPrimera ? 'Sí' : 'No',
            'Fecha Alta': player.registrationDate ? new Date(player.registrationDate).toLocaleDateString('es-AR') : '',
            'Observaciones': player.observations || ''
        };
    });


    exportToExcel(exportData, `jugadores_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export coaches to Excel
 */
export function exportCoachesToExcel(coaches: any[]) {
    const exportData = coaches.map(coach => ({
        'Nombre': coach.name,
        'DNI': coach.dni || '',
        'Fecha Nacimiento': coach.birthDate || '',
        'Teléfono': coach.phone || '',
        'Email': coach.email || '',
        'Rol': coach.role || '',
        'Categorías': coach.category || '', // Schema has 'category' string
        'Tira': coach.tira || '',
        'Estado': coach.status || 'ACTIVO',
        'Salario': coach.salary || 0,
        'Fecha Alta': coach.registrationDate || '',
        'Fecha Baja': coach.withdrawalDate || '',
        'Observaciones': coach.observations || ''
    }));

    exportToExcel(exportData, `entrenadores_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export attendance report to Excel
 */
export function exportAttendanceToExcel(data: any[]) {
    const exportData = data.map(row => {
        // Format date dd/MM/yyyy
        const date = new Date(row.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        return {
            'Fecha': formattedDate,
            'Categoría': row.category,
            'Tira': row.tira,
            'Entrenador': row.coachName || '-',
            'Presentes': row.presentCount,
            'Total': row.totalCount,
            'Porcentaje': `${Math.round((row.presentCount / row.totalCount) * 100)}%`,
            'Jugadores Presentes': row.presentPlayers.join(', ')
        };
    });

    exportToExcel(exportData, `asistencia_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export salary report to Excel
 */
export function exportSalariesToExcel(coaches: any[], year: number) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const exportData = coaches.map(coach => {
        const row: any = {
            'Entrenador': coach.name,
        };

        coach.months.forEach((amount: number, idx: number) => {
            row[months[idx]] = amount;
        });

        row['TOTAL'] = coach.total;
        return row;
    });

    // Add Totals Row
    const totalsRow: any = { 'Entrenador': 'TOTAL MENSUAL' };
    let grandTotal = 0;

    // Calculate totals columns
    for (let i = 0; i < 12; i++) {
        const monthTotal = coaches.reduce((sum, c) => sum + (c.months[i] || 0), 0);
        totalsRow[months[i]] = monthTotal;
        grandTotal += monthTotal;
    }
    totalsRow['TOTAL'] = grandTotal;

    exportData.push(totalsRow);

    exportToExcel(exportData, `sueldos_${year}_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export payments report to Excel
 */
export function exportPaymentsToExcel(players: any[]) {
    const exportData = players.map(p => {
        const currentYear = new Date().getFullYear();
        const currentYearMonth = parseInt(new Date().toISOString().slice(0, 7).replace('-', ''));

        const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
        const activityOk = p.scholarship || (p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth);
        const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';

        let status = 'AL DÍA';
        if (!socialOk && !activityOk && !federationOk) status = 'DEUDA TOTAL';
        else if (!socialOk) status = 'DEUDA SOCIAL';
        else if (!activityOk) status = 'DEUDA ACTIVIDAD';
        else if (!federationOk) status = 'DEUDA FEDERACIÓN';

        return {
            'Jugador': p.name,
            'Categoría': p.category,
            'Tira': p.tira,
            'Estado': status,
            'Últ. Pago Social': p.lastSocialPayment || '-',
            'Últ. Pago Actividad': p.scholarship ? 'BECADO' : (p.lastActivityPayment || '-'),
            'Federación/Seguro': p.federationYear ? `${p.federationYear} - ${p.federationInstallments}` : '-'
        };
    });

    exportToExcel(exportData, `pagos_${new Date().toISOString().split('T')[0]}`);
}
