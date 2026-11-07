require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const User = require('./models/User');
const ServiceRecord = require('./models/ServiceRecord');

const fs = require('fs');

const MONGO_URI = process.argv[2] || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alakh_kirpa';
const EXCEL_PATH = process.argv[3] || 'C:\\Users\\Admin\\Downloads\\AquaTrack_2026-04-21.xlsx';

async function importData() {
  try {
    if (!fs.existsSync(EXCEL_PATH)) {
      console.error(`Excel file not found at: ${EXCEL_PATH}`);
      console.log('Usage: node import-data.js [MONGO_URI] [EXCEL_FILE_PATH]');
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI.includes('@') ? 'Cloud MongoDB Atlas' : MONGO_URI}`);

    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let newCustomers = 0;
    let newServices = 0;

    for (const row of rows) {
      if (!row.Phone || !row.Name) continue;
      
      const phoneStr = String(row.Phone).trim();
      
      // Upsert Customer
      let customer = await User.findOne({ phone: phoneStr });
      if (!customer) {
        customer = new User({
          name: row.Name,
          phone: phoneStr,
          address: row.Address || '',
          filterType: 'Standard RO',
          role: 'customer'
        });
        await customer.save();
        newCustomers++;
      }

      // Add Service Record if it exists
      if (row['Last Service Date']) {
        // Extract cost from notes if possible (e.g. "500 ruppees" -> 500)
        let cost = 0;
        const noteStr = row.Notes || '';
        const match = noteStr.match(/(\d+)/);
        if (match) {
          cost = parseInt(match[1]);
        }

        const partsStr = row['Last Materials'] || '';
        const partsArray = partsStr.split(',').map(s => s.trim()).filter(Boolean);

        const record = new ServiceRecord({
          customerId: customer._id,
          serviceDate: row['Last Service Date'],
          serviceType: row['Last Service Type'] || 'Other',
          partsReplaced: partsArray,
          cost: cost,
          notes: noteStr
        });
        await record.save();
        newServices++;
      }
    }

    console.log(`\nImport Complete!`);
    console.log(`- Inserted ${newCustomers} new customers.`);
    console.log(`- Inserted ${newServices} service records.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error during import:', err);
    process.exit(1);
  }
}

importData();
