const express = require('express'),
  mongoose = require('mongoose'),
  zmq = require('zeromq'),
  { BlobServiceClient } = require('@azure/storage-blob'),
  csv = require('csv-parser'),
  insightsApi = express.Router();

// file model
const Insights = require('../models/Insights');
const Sales = require('../models/SalesData');
const { saveProcessLog } = require('../models/ProcessLog');

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
          totalSales: 1000,
          salesByCountry: { US: 500, UK: 300, CA: 200 },
          quantityByCountry: { US: 50, UK: 30, CA: 20 },
          topProducts: [
            { productId: 'P1', amount: 400 },
            { productId: 'P2', amount: 300 },
            { productId: 'P3', amount: 200 }
          ]
        };
      } else {
        insights = await processBlobFile(fileName);
      }

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

      // Update the sales data with insightsId (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        await Sales.updateOne(
          { _id: data._id },
          { $set: { insightsId: insightsData._id } }
        );
      }
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