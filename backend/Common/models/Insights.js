const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    salesId: String,
    countrySales: {
        type: Map,
        of: Number
    },
    countryQuantitySales: {
        type: Map,
        of: Number
    },
    topProduct: [
        {
            productId: String,
            amount: Number
        }
    ],
    totalSales: String
}, {
    collection: 'insights'
})

module.exports = mongoose.model('Insights', blogSchema)