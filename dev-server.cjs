const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
const createPaymentIntentHandler = require('./api/create-payment-intent.cjs');

// API routes
app.post('/api/create-payment-intent', createPaymentIntentHandler.default);

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
});