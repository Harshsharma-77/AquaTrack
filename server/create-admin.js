require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alakh_kirpa';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    
    const exists = await User.findOne({ phone: 'admin' });
    if (exists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const admin = new User({
      name: 'Super Admin',
      phone: 'admin',
      password: 'admin',
      role: 'admin'
    });

    await admin.save();
    console.log('Success! Admin user created. You can now login with Phone: "admin" and Password: "admin"');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
