const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb://localhost:27017/login-tut');

connect
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Cannot connect to MongoDB:', err);
  });

// Schema
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const collection = mongoose.model('users', LoginSchema);

module.exports = collection;
