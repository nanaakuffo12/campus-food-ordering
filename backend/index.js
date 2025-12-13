const express = require('express');
const { createConnection } = require('typeorm');
const config = require('./config');
const app = require('./app');

const PORT = config.port;

const startServer = async () => {
    try {
        // Initialize TypeORM database connection
        await createConnection({
            type: 'postgres',
            host: config.db.host,
            port: config.db.port,
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            synchronize: config.db.synchronize,
            logging: config.db.logging,
            ssl: config.db.ssl,
            entities: ['./models/**/*.js'],
        });
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1);
    }
};

startServer();
