const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, default: 'ANGLE COURIER', trim: true },
    logo: { type: String, trim: true },
    primaryColor: { type: String, default: '#0F766E' },
    address: { type: String, trim: true },
    contact: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
