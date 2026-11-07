const router = require('express').Router();
const User = require('../models/User');
const ServiceRecord = require('../models/ServiceRecord');
const { verifyToken } = require('../middleware/auth');

// All routes here require basic user authentication
router.use(verifyToken);

// GET customer profile and service history
router.get('/profile', async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const customer = await User.findById(req.user._id).select('-password');
    if (!customer) return res.status(404).json({ message: 'User not found' });
    
    // Fetch their service history
    const history = await ServiceRecord.find({ customerId: req.user._id }).sort({ serviceDate: -1 });
    res.json({ customer, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile (optional)
router.put('/profile', async (req, res) => {
  try {
    const { address } = req.body; // allow customers to update their address
    const updated = await User.findByIdAndUpdate(req.user._id, { address }, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
