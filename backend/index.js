const express = require('express');
const { createConnection } = require('typeorm');
const config = require('./config');
const app = require('./app');

const PORT = config.default.port;

const startServer = async () => {
    try {
        // Initialize TypeORM database connection
        await createConnection({
            type: 'postgres',
            host: config.default.db.host,
            port: config.default.db.port,
            username: config.default.db.username,
            password: config.default.db.password,
            database: config.default.db.database,
            synchronize: config.default.db.synchronize,
            logging: config.default.db.logging,
            ssl: config.default.db.ssl,
            entities: ['./models/**/*.js'],
        });
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${config.default.nodeEnv}`);
        });
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1);
    }
};

startServer();
