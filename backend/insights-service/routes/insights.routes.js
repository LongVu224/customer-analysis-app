const express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  zmq = require('zeromq'),
  { BlobServiceClient } = require('@azure/storage-blob'),
  csv = require('csv-parser'),
  stream = require('stream'),
  router = express.Router();

// file model
const Insights = require('../models/Insights');
const SalesData = require('../models/SalesData');

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

    // Process the data here
    for await (const [msg] of pullSocket) {
      const message = JSON.parse(msg.toString());

      try {
        const fileName = message.fileName;
        const insights = await processBlobFile(fileName);

        // Save the insights data to the database
        const insightsData = new Insights({
          id: new mongoose.Types.ObjectId(),
          salesId: message.id,
          countrySales: insights.salesByCountry,
          countryQuantitySales: insights.quantityByCountry,
          topProduct: insights.topProducts,
          totalSales: insights.totalSales
        });
        await insightsData.save();

        // Update the sales data with insightsId
        await SalesData.updateOne(
          { id: message.id },
          { $set: { insightsId: insightsData.id } }
        );
      } catch (err) {
        console.error('Error processing file:', err);
      }
    }
  }
}