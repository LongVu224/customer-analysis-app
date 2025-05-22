const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.models.Sales || mongoose.model('Sales', salesSchema);