const mongoose = require('mongoose');

const categoriesSchema = mongoose.Schema({
    name: String,
    icon: String,
    color: String,
});

exports.Categories = mongoose.model('Categories', categoriesSchema);
