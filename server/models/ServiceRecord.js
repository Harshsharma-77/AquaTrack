const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceDate: { type: Date, required: true },
  serviceType: { type: String, required: true }, // e.g., 'half-yearly', 'yearly', or custom
  partsReplaced: [{ type: String }],
  cost: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'Online', 'Bank Transfer'], default: 'Cash' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
