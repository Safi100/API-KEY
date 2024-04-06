const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

function generateApiKey() {
    return crypto.randomBytes(32).toString('hex'); // Generates a 64-character hexadecimal string
}

const KeySchema = new Schema({
    value: {
        type: String,
        required: [true, 'value is required'],
        default: generateApiKey()
    },
    requests_per_month: {
        type: Number,
        required: [true, 'Requests per month is required'],
    },
    expiration_date: {
        type: Date,
        required: [true, 'expiration date is required']
    }
}, {timestamps: true});

module.exports = mongoose.model('Api_Key', KeySchema);