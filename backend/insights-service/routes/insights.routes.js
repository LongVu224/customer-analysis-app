const express = require('express'),
  mongoose = require('mongoose'),
  zmq = require('zeromq'),
  { BlobServiceClient } = require('@azure/storage-blob'),
  csv = require('csv-parser'),
  insightsApi = express.Router();

// file model
const Insights = require('../models/Insights');
const Sales = require('../models/SalesData');

// env configuration
const config = require("../config/config");

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${config.storageName};AccountKey=${config.storageKey};EndpointSuffix=core.windows.net`
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('sales');

async function processBlobFile(blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download();

  // There will be 7 columns in the CSV file: OderId, ProductId, Date, Country, Quantity, Price, Amount
  // we will need to calculate sales for each country, quantity sales for each country, top 10 products, and total sales
  let totalSales = 0;
  const salesByCountry = {};
  const quantityByCountry = {};
  const productSales = {};

  await new Promise((resolve, reject) => {
    const blobStream = downloadResponse.readableStreamBody;
    if (!blobStream) return reject("Failed to get blob stream");

    blobStream
      .pipe(csv())
      .on('data', (row) => {
        const country = row.Country;
        const quantity = parseInt(row.Quantity, 10);
        const amount = parseFloat(row.Amount);
        const productId = row.ProductId;

        if (!isNaN(amount)) totalSales += amount;

        // Sales per country
        if (country) {
          salesByCountry[country] = (salesByCountry[country] || 0) + amount;
          quantityByCountry[country] = (quantityByCountry[country] || 0) + quantity;
        }

        // Product sales
        if (productId) {
          productSales[productId] = (productSales[productId] || 0) + amount;
        }
      })
      .on('end', () => resolve())
      .on('error', reject);
  });

  // Compute top 10 products
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId, amount]) => ({ productId, amount }));

  // Return the results
  return {
    totalSales: parseFloat(totalSales.toFixed(2)),
    salesByCountry,
    quantityByCountry,
    topProducts
  };
}

async function insightsWorker() {
  // zeroMQ setup
  const pullSocket = new zmq.Pull();
  pullSocket.connect("tcp://127.0.0.1:65439");
  console.log("Listening for messages on port 65439...");

  for await (const [msg] of pullSocket) {
    const data = JSON.parse(msg.toString());
    console.log("Received message:", data);

    try {
      const fileName = data.fileName;
      const insights = await processBlobFile(fileName);

      // Save the insights data to the database
      const insightsData = new Insights({
        _id: new mongoose.Types.ObjectId(),
        salesId: data._id,
        countrySales: insights.salesByCountry,
        countryQuantitySales: insights.quantityByCountry,
        topProduct: insights.topProducts,
        totalSales: insights.totalSales
      });
      await insightsData.save();

      // Update the sales data with insightsId
      await Sales.updateOne(
        { _id: data._id },
        { $set: { insightsId: insightsData._id } }
      );
    } catch (err) {
      console.error('Error processing file:', err);
    }
  }
}

// Get all sales data endpoint
insightsApi.get("/", (req, res) => {
  Insights.find().then(data => {
    res.status(200).json({
      insights: data
    });
  }).catch(err => {
    console.log(err),
    res.status(500).json({
      error: err
    })
  });
});

module.exports = {insightsApi, insightsWorker};