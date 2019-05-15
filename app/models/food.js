const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const FoodSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  hash: {
    type: String,
    required: true
  }
}, { collection: 'food', versionKey: false});

module.exports = mongoose.model('food', FoodSchema);
