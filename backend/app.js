const express = require('express');
const { authRoutes } = require('./routes/auth');
const { usersRoutes } = require('./routes/users');
const { menuRoutes } = require('./routes/menu');
const { ordersRoutes } = require('./routes/orders');
const { errorHandler } = require('./middleware/error');

const app = express();

// CORS Configuration - Allow multiple origins for development and GitHub Pages
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://nanaakuffo12.github.io',
    process.env.CORS_ORIGIN // Add any additional origin from env
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow requests from allowed origins or if it matches the CORS_ORIGIN env var
    if (allowedOrigins.includes(origin) || 
        (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // Default to localhost for local development
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Built-in Express body parsing (replaces deprecated body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes());
app.use('/api/users', usersRoutes());
app.use('/api/menu', menuRoutes());
app.use('/api/orders', ordersRoutes());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
