const express = require('express'),
  multer = require('multer'),
  moment= require('moment') 
  mongoose = require('mongoose'),
  zmq = require('zeromq'),
  { v4: uuidV4 } = require('uuid'),
  { MulterAzureStorage  } = require('multer-azure-blob-storage'),
  router = express.Router();

// file model
const SalesData = require('../models/SalesData');
const { saveProcessLog } = require('../models/ProcessLog');

// env configuration
const config = require("../config/config");

const resolveBlobName = (req, file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    const blobName = uuidV4() + '-' + fileName;
    resolve(blobName);
  });
};

const resolveMetadata = (req, file) => {
  return new Promise((resolve, reject) => {
    const metadata = {fieldName: file.fieldname};
    resolve(metadata);
  });
};

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${config.storageName};AccountKey=${config.storageKey};EndpointSuffix=core.windows.net`

let upload;

// Mock storage for testing -> files won't be uploaded
if (process.env.NODE_ENV === 'test') {
  upload = multer({ storage: multer.memoryStorage() });
} else {
  const azureStorage = new MulterAzureStorage({
    connectionString: connectionString,
    accessKey: config.storageKey,
    accountName: config.storageName,
    containerName: 'sales',
    blobName: resolveBlobName,
    metadata: resolveMetadata,
  });

  // middleware for uploading files
  upload = multer({
    storage: azureStorage
  });
}

// Create sales data endpoint
router.post('/', upload.array('saleFile', 10), async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    await saveProcessLog('upload-service', 'createSalesData', 'No file uploaded');
    return res.status(400).json({ error: "No file uploaded." });
  }

  const curDate = moment().format('MMMM Do YYYY, h:mm:ss a')

  // Create sales data instance
  const sales = new SalesData({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    description: req.body.description,
    fileName: process.env.NODE_ENV != 'test' ? req.files[0].blobName : req.files[0].originalname,
    date: curDate,
  });

  return (async () => {
    try {
      // Save data to database
      const result = await sales.save();
      await saveProcessLog('upload-service', 'createSalesData', `Sales data created with ID: ${result._id}`);

      // Initialize message sent flag
      let messageSent = false;

      // Create zeroMQ payload
      const resultPayload = {
        _id: result._id,
        title: result.title,
        description: result.description,
        fileName: result.fileName,
        date: result.date
      }

      // Only run ZeroMQ logic if not in test NODE_ENV or description is "ZeroMQ Test"
      if (process.env.NODE_ENV !== 'test' || req.body.description === 'ZeroMQ Test') {
        // Open a ZeroMQ push socket
        const pushSocket = new zmq.Push();
        await pushSocket.connect("tcp://127.0.0.1:65439");

        // Send data to ZeroMQ
        await pushSocket.send(JSON.stringify(resultPayload));
        messageSent = true;
        console.log("Data sent to ZeroMQ");

        // Log the message sent
        await saveProcessLog('upload-service', 'createSalesData', `Message sent to ZeroMQ`);

        // Close the ZeroMQ socket
        await pushSocket.close();
      }

      await saveProcessLog('upload-service', 'createSalesData', `Sales data with ID: ${result._id} processed successfully`);
      return res.status(201).json({
        message: "File uploaded successfully!",
        saleDataCreated: resultPayload,
        messageSent: messageSent
      });
    } catch (err) {
        console.log(err);
        await saveProcessLog('upload-service', 'createSalesData', `Error creating sales data: ${err.message}`);
        return res.status(500).json({
          error: err.message || "An error occurred while processing your request."
        });
    }
  })();
})

// Get all sales data endpoint
router.get("/", (req, res) => {
  SalesData.find().then(async data => {
    await saveProcessLog('upload-service', 'getAllSalesData', `Fetched all sales records successfully`);
    res.status(200).json({
      sales: data
    });
  }).catch(async err => {
    console.log(err),
    await saveProcessLog('upload-service', 'getAllSalesData', `Error fetching sales data: ${err.message}`);
    res.status(500).json({
      error: err
    })
  });
});

// Get sales data by id endpoint
router.get("/:id", (req, res) => {
  SalesData.findById(req.params.id).then(async data => {
    await saveProcessLog('upload-service', 'getSalesDataById', `Fetched sales data for ID: ${req.params.id}`);
    res.status(200).json({
      sale: data
    })
  }).catch(async err => {
    console.log(err),
    await saveProcessLog('upload-service', 'getSalesDataById', `Error fetching sales data for ID: ${req.params.id}`);
    res.status(500).json({
      error: err
    })
  });;
});

module.exports = router;