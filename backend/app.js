const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// import routes
const productRoutes = require('./routes/productRoutes');

// use routes
app.use(productRoutes);

// connect to MongoDB
mongoose.connect(process.env.mongodb_url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));