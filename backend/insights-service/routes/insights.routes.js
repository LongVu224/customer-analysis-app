const express = require('express'),
  mongoose = require('mongoose'),
  zmq = require('zeromq'),
  { BlobServiceClient } = require('@azure/storage-blob'),
  { DefaultAzureCredential } = require('@azure/identity'),
  csv = require('csv-parser'),
  insightsApi = express.Router();

// file model
const Insights = require('../models/Insights');
const Sales = require('../models/SalesData');
const { saveProcessLog } = require('../models/ProcessLog');

// env configuration
const config = require("../config/config");

// Create BlobServiceClient using DefaultAzureCredential (supports managed identity and local Azure CLI)
// Falls back to connection string if storage key is provided
let blobServiceClient;
if (config.storageKey) {
  // Use connection string with storage key (legacy/fallback)
  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${config.storageName};AccountKey=${config.storageKey};EndpointSuffix=core.windows.net`;
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
} else {
  // Use DefaultAzureCredential (managed identity in prod, Azure CLI locally)
  const credential = new DefaultAzureCredential();
  blobServiceClient = new BlobServiceClient(config.storageUrl, credential);
}
const containerClient = blobServiceClient.getContainerClient('sales');

async function processBlobFile(blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download();

  // Data structures for comprehensive analytics
  let totalRevenue = 0;
  let totalQuantity = 0;
  let orderCount = 0;
  const orderIds = new Set();
  const productIds = new Set();
  const countries = new Set();
  const prices = [];
  
  // Country analytics
  const countryData = {};
  // Product analytics  
  const productData = {};
  // Daily trends
  const dailyData = {};

  await new Promise((resolve, reject) => {
    const blobStream = downloadResponse.readableStreamBody;
    if (!blobStream) return reject("Failed to get blob stream");

    blobStream
      .pipe(csv())
      .on('data', (row) => {
        const orderId = row.OrderId;
        const productId = row.ProductId;
        const date = row.Date;
        const country = row.Country;
        const quantity = parseInt(row.Quantity, 10) || 0;
        const price = parseFloat(row.Price) || 0;
        const amount = parseFloat(row.Amount) || 0;

        // Track unique values
        if (orderId) orderIds.add(orderId);
        if (productId) productIds.add(productId);
        if (country) countries.add(country);
        if (price > 0) prices.push(price);

        // Accumulate totals
        totalRevenue += amount;
        totalQuantity += quantity;
        orderCount++;

        // Country analytics
        if (country) {
          if (!countryData[country]) {
            countryData[country] = { revenue: 0, quantity: 0, orders: 0 };
          }
          countryData[country].revenue += amount;
          countryData[country].quantity += quantity;
          countryData[country].orders += 1;
        }

        // Product analytics
        if (productId) {
          if (!productData[productId]) {
            productData[productId] = { revenue: 0, quantity: 0, orders: 0 };
          }
          productData[productId].revenue += amount;
          productData[productId].quantity += quantity;
          productData[productId].orders += 1;
        }

        // Daily trends
        if (date) {
          if (!dailyData[date]) {
            dailyData[date] = { revenue: 0, quantity: 0, orders: 0 };
          }
          dailyData[date].revenue += amount;
          dailyData[date].quantity += quantity;
          dailyData[date].orders += 1;
        }
      })
      .on('end', () => resolve())
      .on('error', reject);
  });

  // Calculate KPIs
  const totalOrders = orderIds.size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Compute top 10 countries by revenue
  const topCountries = Object.entries(countryData)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([country, data]) => ({
      country,
      revenue: parseFloat(data.revenue.toFixed(2)),
      orders: data.orders,
      quantity: data.quantity
    }));

  // Compute top 10 products by revenue
  const topProducts = Object.entries(productData)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([productId, data]) => ({
      productId,
      revenue: parseFloat(data.revenue.toFixed(2)),
      quantity: data.quantity,
      orders: data.orders
    }));

  // Sort daily trends by date
  const dailyTrends = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, data]) => ({
      date,
      revenue: parseFloat(data.revenue.toFixed(2)),
      orders: data.orders,
      quantity: data.quantity
    }));

  // Legacy format for backward compatibility
  const salesByCountry = {};
  const quantityByCountry = {};
  Object.entries(countryData).forEach(([country, data]) => {
    salesByCountry[country] = parseFloat(data.revenue.toFixed(2));
    quantityByCountry[country] = data.quantity;
  });

  const topProductLegacy = topProducts.map(p => ({ productId: p.productId, amount: p.revenue }));

  // Return comprehensive results
  return {
    kpis: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalQuantity,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      uniqueProducts: productIds.size,
      uniqueCountries: countries.size
    },
    dailyTrends,
    topCountries,
    topProducts,
    // Legacy fields
    totalSales: parseFloat(totalRevenue.toFixed(2)),
    salesByCountry,
    quantityByCountry,
    topProductLegacy
  };
}

async function insightsWorker() {
  // zeroMQ setup
  const pullSocket = new zmq.Pull();
  await pullSocket.bind("tcp://127.0.0.1:65439");
  console.log("Listening for messages on port 65439...");
  await saveProcessLog('insights-service', 'insightsWorker', 'Information', 'Worker started and listening for messages');

  for await (const [msg] of pullSocket) {
    const data = JSON.parse(msg.toString());
    console.log("Received message:", data);
    await saveProcessLog('insights-service', 'insightsWorker', 'Information',`Received message: ${JSON.stringify(data)}`);

    try {
      const fileName = data.fileName;
      let insights;

      // return mock data if in test environment
      if (process.env.NODE_ENV === 'test') {
        insights = {
          kpis: {
            totalRevenue: 1000,
            totalOrders: 10,
            totalQuantity: 100,
            avgOrderValue: 100,
            avgPrice: 50,
            uniqueProducts: 5,
            uniqueCountries: 3
          },
          dailyTrends: [
            { date: '2025-03-01', revenue: 300, orders: 3, quantity: 30 },
            { date: '2025-03-02', revenue: 400, orders: 4, quantity: 40 },
            { date: '2025-03-03', revenue: 300, orders: 3, quantity: 30 }
          ],
          topCountries: [
            { country: 'US', revenue: 500, orders: 5, quantity: 50 },
            { country: 'UK', revenue: 300, orders: 3, quantity: 30 },
            { country: 'CA', revenue: 200, orders: 2, quantity: 20 }
          ],
          topProducts: [
            { productId: 'P1', revenue: 400, quantity: 40, orders: 4 },
            { productId: 'P2', revenue: 300, quantity: 30, orders: 3 },
            { productId: 'P3', revenue: 200, quantity: 20, orders: 2 }
          ],
          totalSales: 1000,
          salesByCountry: { US: 500, UK: 300, CA: 200 },
          quantityByCountry: { US: 50, UK: 30, CA: 20 },
          topProductLegacy: [
            { productId: 'P1', amount: 400 },
            { productId: 'P2', amount: 300 },
            { productId: 'P3', amount: 200 }
          ]
        };
      } else {
        insights = await processBlobFile(fileName);
      }

      // Save the insights data to the database with new analytics
      const insightsData = new Insights({
        _id: new mongoose.Types.ObjectId(),
        salesId: data._id,
        // New analytics fields
        kpis: insights.kpis,
        dailyTrends: insights.dailyTrends,
        topCountries: insights.topCountries,
        topProducts: insights.topProducts,
        // Legacy fields for backward compatibility
        countrySales: insights.salesByCountry,
        countryQuantitySales: insights.quantityByCountry,
        topProduct: insights.topProductLegacy,
        totalSales: insights.totalSales,
        processedAt: new Date()
      });
      await insightsData.save();

      // Update the sales data with insightsId (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        await Sales.updateOne(
          { _id: data._id },
          { $set: { insightsId: insightsData._id } }
        );
      }
      
      await saveProcessLog('insights-service', 'insightsWorker', 'Information', 
        `Successfully processed insights for salesId: ${data._id} - Revenue: ${insights.kpis.totalRevenue}, Orders: ${insights.kpis.totalOrders}`);
    } catch (err) {
      console.error('Error processing file:', err);
      await saveProcessLog('insights-service', 'insightsWorker', 'Error', `Error processing message: ${err.message}`);
    }
  }
}

// Get all insights data endpoint
insightsApi.get("/", (req, res) => {
  Insights.find().then(async data => {
    await saveProcessLog('insights-service', 'getAllInsights', 'Information', `Fetched insights records successfully`);
    res.status(200).json({
      insights: data
    });
  }).catch(async err => {
    console.log(err),
    await saveProcessLog('insights-service', 'getAllInsights', 'Error', `Error fetching insights: ${err.message}`);
    res.status(500).json({
      error: err
    })
  });
});

// Get insights by salesId endpoint
insightsApi.get("/:salesId", (req, res) => {
  const salesId = req.params.salesId;
  Insights.findOne
    ({ salesId: salesId })
    .then(async data => {
      if (!data) {
        await saveProcessLog('insights-service', 'getInsightsBySalesId', 'Error', `No insights found for salesId: ${salesId}`);
        return res.status(404).json({
          message: "Insights not found for the given salesId"
        });
      }

      await saveProcessLog('insights-service', 'getInsightsBySalesId', 'Information', `Fetched insights for salesId: ${salesId}`);
      res.status(200).json({
        insights: data
      });
    })
    .catch(async err => {
      console.log(err);
      await saveProcessLog('insights-service', 'getInsightsBySalesId', 'Error', `Error fetching insights for salesId ${salesId}: ${err.message}`);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = {insightsApi, insightsWorker};