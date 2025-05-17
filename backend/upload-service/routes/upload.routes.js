const express = require('express'),
  multer = require('multer'),
  moment= require('moment') 
  mongoose = require('mongoose'),
  { v4: uuidV4 } = require('uuid'),
  { MulterAzureStorage  } = require('multer-azure-blob-storage'),
  router = express.Router();

// file model
const SalesData = require('../models/SalesData');

// env configuration
const config = require("../config/config");

// zeromq configuration
const zmq = require('zeromq');
const pushSocket = new zmq.Push();

(async () => {
  await pushSocket.bind("tcp://127.0.0.1:6543");
})();

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

const azureStorage = new MulterAzureStorage({
  connectionString: connectionString,
  accessKey: config.storageKey,
  accountName: config.storageName,
  containerName: 'sales',
  blobName: resolveBlobName,
  metadata: resolveMetadata,
});

// middleware for uploading files
const upload = multer({
  storage: azureStorage
});

// Create sales data endpoint
router.post('/', upload.array('saleFile', 10), (req, res, next) => {
  const curDate = moment().format('MMMM Do YYYY, h:mm:ss a')

  // Create sales data instance
  const sales = new SalesData({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    description: req.body.description,
    fileName: req.files.map(file => file.blobName),
    date: curDate,
  });
  
  const payload = {
    title: req.body.title,
    description: req.body.description,
    fileName: req.files.map(file => file.blobName),
    date: curDate,
  };

  (async () => {
    try {
      // Send data to ZeroMQ
      await pushSocket.send(JSON.stringify(payload));
      console.log("Data sent to ZeroMQ");

      // Save data to database
      const result = await sales.save();
      res.status(201).json({
        message: "File uploaded successfully!",
        saleDataCreated: {
          _id: result._id,
          fileName: result.fileName,
          title: result.title,
          description: result.description,
          date: result.date
        }
      });
    } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err
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