const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    salesId: String,
    countrySales: [
        { type: String }
    ],
    countryQuantitySales: [
        { type: String }
    ],
    topProduct: [
        { type: String }
    ],
    totalSales: String
}, {
    collection: 'insights'
})

module.exports = mongoose.model('Sales', blogSchema)