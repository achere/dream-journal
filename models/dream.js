const mongoose = require('mongoose');

const dreamSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timesince: {
    type: Number,
    required: true
  },
  timeuntil: {
    type: Number,
    required: true
  },
  lucid: {
    type: Boolean,
    required: true
  },
  lucidity: {
    type: String,
    required: false
  },
  setting: {
    type: String,
    required: false
  }
});

let Dream = module.exports = mongoose.model('Dream', dreamSchema, 'dreams');