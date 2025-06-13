const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serviceName: String,
    processName: String,
    message: String,
    date: String
}, {
    collection: 'processLogs'
})

const saveProcessLog = async (serviceName, processName, message) => {
    const ProcessLog = mongoose.model('ProcessLog', logSchema);
    const logEntry = new ProcessLog({
      _id: new mongoose.Types.ObjectId(),
      serviceName: serviceName,
      processName: processName,
      message: message,
      date: new Date().toISOString()
    });

    try {
        await logEntry.save();
    } catch (error) {
        console.error('Error saving log:', error);
    }
}

module.exports = {
    ProcessLog: mongoose.model('ProcessLog', logSchema),
    saveProcessLog: saveProcessLog
};