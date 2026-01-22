const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'docs', 'Listado cuotas Basquet al 19 de enero.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\nSheet: ${sheetName}`);
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        console.log('Sample Row:', data[1]);
    } else {
        console.log('Empty sheet');
    }
});
