const router = require('express').Router();
const User = require('../models/User');
const ServiceRecord = require('../models/ServiceRecord');
const { verifyAdmin } = require('../middleware/auth');

// Apply admin verification middleware to all routes
router.use(verifyAdmin);

// Dashboard Statistics
router.get('/dashboard', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    const services = await ServiceRecord.find();
    
    const totalCustomers = customers.length;
    const totalServices = services.length;
    const revenue = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);

    res.json({ totalCustomers, totalServices, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Reminders (Services due within 30 days or overdue)
router.get('/reminders', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('name phone filterType address');
    const reminders = [];
    
    const today = new Date();

    for (let customer of customers) {
      const history = await ServiceRecord.find({ 
        customerId: customer._id,
        serviceType: { $in: ['Half-Yearly', 'Yearly', 'Installation'] }
      }).sort({ serviceDate: -1 }).limit(1);

      if (history.length > 0) {
        const last = history[0];
        const nextDate = new Date(last.serviceDate);
        nextDate.setMonth(nextDate.getMonth() + 6); // Always 6 months logic
        
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Show if overdue or due within 30 days
        if (diffDays <= 30) {
          const isLastYearly = last.serviceType.toLowerCase().includes('yearly') && !last.serviceType.toLowerCase().includes('half');
          const expectedNextType = isLastYearly ? 'Half-Yearly' : 'Yearly';
          
          reminders.push({
            customer,
            lastServiceDate: last.serviceDate,
            dueDate: nextDate,
            diffDays,
            expectedNextType
          });
        }
      }
    }

    // Sort by diffDays ascending (most overdue first)
    reminders.sort((a, b) => a.diffDays - b.diffDays);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD new customer
router.post('/customers', async (req, res) => {
  try {
    const { name, phone, address, filterType } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone number already registered' });

    const customer = new User({ name, phone, address, filterType, role: 'customer' });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single customer details with their service history
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    const history = await ServiceRecord.find({ customerId: customer._id }).sort({ serviceDate: -1 });
    res.json({ customer, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE customer
router.put('/customers/:id', async (req, res) => {
  try {
    const { name, phone, address, filterType } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { name, phone, address, filterType }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE customer and their service records
router.delete('/customers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await ServiceRecord.deleteMany({ customerId: req.params.id });
    res.json({ message: 'Customer and history deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD service record
router.post('/services', async (req, res) => {
  try {
    const { customerId, serviceDate, serviceType, partsReplaced, cost, paymentMode, notes } = req.body;
    const record = new ServiceRecord({ customerId, serviceDate, serviceType, partsReplaced, cost, paymentMode, notes });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE service record
router.put('/services/:id', async (req, res) => {
  try {
    const { serviceDate, serviceType, partsReplaced, cost, paymentMode, notes } = req.body;
    const updated = await ServiceRecord.findByIdAndUpdate(
      req.params.id, 
      { serviceDate, serviceType, partsReplaced, cost, paymentMode, notes }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE service record
router.delete('/services/:id', async (req, res) => {
  try {
    await ServiceRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
