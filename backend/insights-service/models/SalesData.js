const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    insightsId: {
        type: String,
        default: null
    },
    fileName: String,
    title: String,
    description: String,
    date: String,
}, {
    collection: 'sales'
})

module.exports = mongoose.model('Sales', salesSchema);