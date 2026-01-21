const XLSX = require('xlsx');
const workbook = XLSX.readFile('docs/Jugadores y Pagos.xlsx');

console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
    console.log(`--- Sheet: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        // Check row 2 to see data types
        if (data.length > 1) console.log('Row 1:', data[1]);
    }
});
