const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    fileName: [
        {type: String}
    ],
    title: String,
    description: String,
    date: String,
}, {
    collection: 'sales'
})

module.exports = mongoose.model('Sales', blogSchema)