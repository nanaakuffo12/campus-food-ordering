const express = require('express');
const { authRoutes } = require('./routes/auth');
const { usersRoutes } = require('./routes/users');
const { menuRoutes } = require('./routes/menu');
const { ordersRoutes } = require('./routes/orders');
const { errorHandler } = require('./middleware/error');

const app = express();

// CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOrigin);
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
