const xlsx = require('xlsx');
const path = 'C:\\Users\\Admin\\Downloads\\AquaTrack_2026-04-21.xlsx';

const workbook = xlsx.readFile(path);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Columns:", Object.keys(data[0] || {}));
console.log("First Row:", data[0]);
console.log("Total rows:", data.length);
