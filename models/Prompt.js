const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title: { type:String, required:true },
    content: { type:String, required:true },
    category : String,
    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    }
});

module.exports = mongoose.model('Prompt', promptSchema);