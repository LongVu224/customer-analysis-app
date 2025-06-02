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
router.post('/', upload.array('saleFile', 10), (req, res, next) => {
  if (!req.files || req.files.length === 0) {
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
        await pushSocket.bind("tcp://127.0.0.1:65439");

        // Send data to ZeroMQ
        await pushSocket.send(JSON.stringify(resultPayload));
        console.log("Data sent to ZeroMQ");

        // Close the ZeroMQ socket
        await pushSocket.close();
      }

      return res.status(201).json({
        message: "File uploaded successfully!",
        saleDataCreated: resultPayload
      });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
          error: err.message || "An error occurred while processing your request."
        });
    }
  })();
})

// Get all sales data endpoint
router.get("/", (req, res) => {
  SalesData.find().then(data => {
    res.status(200).json({
      sales: data
    });
  }).catch(err => {
    console.log(err),
    res.status(500).json({
      error: err
    })
  });
});

// Get sales data by id endpoint
router.get("/:id", (req, res) => {
  SalesData.findById(req.params.id).then(data => {
    res.status(200).json({
      sale: data
    })
  }).catch(err => {
    console.log(err),
    res.status(500).json({
      error: err
    })
  });;
});

module.exports = router;