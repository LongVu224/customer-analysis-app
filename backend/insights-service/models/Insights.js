const mongoose = require('mongoose');

const insightsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    salesId: String,
    
    // Summary KPIs
    kpis: {
        totalRevenue: Number,
        totalOrders: Number,
        totalQuantity: Number,
        avgOrderValue: Number,
        avgPrice: Number,
        uniqueProducts: Number,
        uniqueCountries: Number
    },
    
    // Trend Analysis - Daily sales data
    dailyTrends: [{
        date: String,
        revenue: Number,
        orders: Number,
        quantity: Number
    }],
    
    // Top performers
    topCountries: [{
        country: String,
        revenue: Number,
        orders: Number,
        quantity: Number
    }],
    topProducts: [{
        productId: String,
        revenue: Number,
        quantity: Number,
        orders: Number
    }],
    
    // Legacy fields (kept for backward compatibility)
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
    totalSales: Number,
    
    // Metadata
    processedAt: { type: Date, default: Date.now }
}, {
    collection: 'insights'
})

module.exports = mongoose.model('Insights', insightsSchema)