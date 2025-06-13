const express = require('express'),
  mongoose = require('mongoose'),
  monitorApi = express.Router();

// file model
const { saveProcessLog, ProcessLog } = require('../models/ProcessLog');

// env configuration
const config = require("../config/config");

monitorApi.get('/', async (req, res) => {
  ProcessLog.find()
    .then(logs => {
      res.status(200).json({
        message: "Logs fetched successfully",
        logs: logs
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Error fetching logs",
        error: err.message
      });
    });
});

monitorApi.get('/service/:serviceName', async (req, res) => {
  const serviceName = req.params.serviceName;
  ProcessLog.find({ serviceName: serviceName })
    .then(logs => {
      res.status(200).json({
        message: `Logs fetched successfully for service: ${serviceName}`,
        logs: logs
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Error fetching logs",
        error: err.message
      });
    });
});

module.exports = monitorApi;