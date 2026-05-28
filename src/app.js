const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();
app.disable('x-powered-by');

// CORS for Angular
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true
}));

// Parse JSON from Angular requests - 50MB limit for base64 images
app.use(express.json({ limit: '999999mb' }));
app.use(express.urlencoded({ limit: '999999mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

module.exports = app;
