// server.js (Node.js with Express)

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/product');


// Product Schema
const productSchema = new mongoose.Schema({
  p1: String,
  p2: String,
});

const Product = mongoose.model('Product', productSchema);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html when root route is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle Form Submission
app.post('/compare', async (req, res) => {
  const { p1, p2 } = req.body;
  try {
    const product = new Product({ p1, p2 });
    await product.save();
    res.send('Comparison saved successfully!');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Retrieve and Display Data
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
