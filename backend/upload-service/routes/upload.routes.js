const express = require('express'),
    multer = require('multer'),
    moment= require('moment') 
    mongoose = require('mongoose'),
    { v4: uuidV4 } = require('uuid'),
    { MulterAzureStorage  } = require('multer-azure-blob-storage'),
    { QueueClient  } = require('@azure/storage-queue'),
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

function jsonToBase64(jsonObj) {
    const jsonString = JSON.stringify(jsonObj)
    return  Buffer.from(jsonString).toString('base64')
}

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

const queueClient = new QueueClient(connectionString, 'sales-upload-queue');

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

    const salesMessagePayload = {
        title: req.body.title,
        description: req.body.description,
        fileName: req.files.map(file => file.blobName),
        date: curDate
    }

    // Send message to Azure Queue
    queueClient.sendMessage(jsonToBase64(salesMessagePayload))
        .then(() => {
            console.log('Message sent to sales-upload-queue');
        })
        .catch((err) => {
            console.error('Error sending message to sales-upload-queue:', err);
        }
    );

    // Save data to database
    sales.save().then(result => {
        res.status(201).json({
            message: "File uploaded successfully!",
            saleDataCreated: {
                _id: result._id,
                fileName: result.fileName,
                title: result.title,
                description: result.description,
                date: result.date
            }
        })
    }).catch(err => {
        console.log(err),
        res.status(500).json({
            error: err
        });
    })
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