const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Admin and Customer Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPass = await user.comparePassword(password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initial Admin Registration (Can be removed or secured later)
router.post('/register-admin', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const admin = new User({ name, phone, password, role: 'admin' });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer Registration (Sets password for an existing customer created by Admin)
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ message: 'Phone number not found. Please contact admin to add your details first.' });
    }
    if (user.password) {
      return res.status(400).json({ message: 'Account already registered. Please login.' });
    }

    user.password = password;
    await user.save();
    res.json({ message: 'Registration successful! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
