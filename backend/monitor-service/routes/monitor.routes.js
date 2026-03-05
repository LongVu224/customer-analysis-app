const express = require('express'),
  mongoose = require('mongoose'),
  monitorApi = express.Router();

// file model
const { ProcessLog } = require('../models/ProcessLog');

// env configuration
const config = require("../config/config");

// Get all logs (basic)
monitorApi.get('/', async (req, res) => {
  ProcessLog.find()
    .sort({ date: -1 })
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

// Get logs by service name
monitorApi.get('/service/:serviceName', async (req, res) => {
  const serviceName = req.params.serviceName;
  ProcessLog.find({ serviceName: serviceName })
    .sort({ date: -1 })
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

// Get detailed logs with pagination and filters
monitorApi.get('/logs', async (req, res) => {
  try {
    const { 
      service, 
      type, 
      page = 1, 
      limit = 50,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};
    
    if (service) {
      query.serviceName = service;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { processName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      ProcessLog.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProcessLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
      error: err.message
    });
  }
});

// Get log statistics (totals by service)
monitorApi.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await ProcessLog.aggregate([
      {
        $match: {
          date: { $gte: startDate.toISOString() }
        }
      },
      {
        $group: {
          _id: {
            service: '$serviceName',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.service',
          types: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    // Format stats by service
    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        total: stat.total,
        types: {}
      };
      stat.types.forEach(t => {
        formattedStats[stat._id].types[t.type] = t.count;
      });
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
      period: `Last ${days} days`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: err.message
    });
  }
});

// Get daily chart data (logs per day, grouped by service and type)
monitorApi.get('/stats/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await ProcessLog.aggregate([
      {
        $match: {
          date: { $gte: startDate.toISOString() }
        }
      },
      {
        $addFields: {
          dateObj: { $dateFromString: { dateString: '$date' } }
        }
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$dateObj' } },
            service: '$serviceName',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ]);

    // Transform into chart-friendly format
    // Each day has: upload_info, upload_error, insights_info, insights_error, investment_info, investment_error
    const dayMap = {};
    
    stats.forEach(stat => {
      const day = stat._id.day;
      if (!dayMap[day]) {
        dayMap[day] = {
          day: new Date(day).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
          upload_info: 0,
          upload_error: 0,
          insights_info: 0,
          insights_error: 0,
          investment_info: 0,
          investment_error: 0
        };
      }
      
      const service = stat._id.service;
      const type = stat._id.type === 'Information' ? 'info' : 'error';
      
      if (service === 'upload-service') {
        dayMap[day][`upload_${type}`] = stat.count;
      } else if (service === 'insights-service') {
        dayMap[day][`insights_${type}`] = stat.count;
      } else if (service === 'investment-service') {
        dayMap[day][`investment_${type}`] = stat.count;
      }
    });

    // Convert to array sorted by date
    const chartData = Object.values(dayMap);

    res.status(200).json({
      success: true,
      data: chartData,
      period: `Last ${days} days`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching daily stats",
      error: err.message
    });
  }
});

// Check health of all services
monitorApi.get('/health/all', async (req, res) => {
  const results = {};
  
  for (const [serviceId, serviceConfig] of Object.entries(config.services)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `${serviceConfig.url}${serviceConfig.healthEndpoint}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      
      results[serviceId] = {
        name: serviceConfig.name,
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        url: serviceConfig.displayUrl || serviceConfig.url,
        lastChecked: new Date().toISOString()
      };
    } catch (err) {
      results[serviceId] = {
        name: serviceConfig.name,
        status: 'offline',
        error: err.name === 'AbortError' ? 'Timeout' : err.message,
        url: serviceConfig.displayUrl || serviceConfig.url,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Get recent log counts for each service
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const logCounts = await ProcessLog.aggregate([
      {
        $match: {
          date: { $gte: oneDayAgo.toISOString() }
        }
      },
      {
        $group: {
          _id: {
            service: '$serviceName',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    logCounts.forEach(lc => {
      if (results[lc._id.service]) {
        if (!results[lc._id.service].logs) {
          results[lc._id.service].logs = { total: 0, errors: 0, info: 0 };
        }
        results[lc._id.service].logs.total += lc.count;
        if (lc._id.type === 'Error') {
          results[lc._id.service].logs.errors = lc.count;
        } else {
          results[lc._id.service].logs.info += lc.count;
        }
      }
    });
  } catch (err) {
    console.error('Error fetching log counts:', err);
  }

  res.status(200).json({
    success: true,
    data: results,
    timestamp: new Date().toISOString()
  });
});

// Get available services list
monitorApi.get('/services', async (req, res) => {
  const services = Object.entries(config.services).map(([id, cfg]) => ({
    id,
    name: cfg.name,
    url: cfg.displayUrl || cfg.url
  }));
  
  res.status(200).json({
    success: true,
    data: services
  });
});

module.exports = monitorApi;