const express = require('express');
const config = require('./config');
const app = require('./app');

const PORT = config.port;

const startServer = () => {
    try {
        console.log('📊 Using in-memory database (development mode)');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📝 Environment: ${config.nodeEnv}`);
            console.log(`🔗 API available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Error starting server', error);
        process.exit(1);
    }
};

startServer();
