require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'campus_food_ordering',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
    logging: process.env.DB_LOGGING === 'true' || false,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'https://nanaakuffo12.github.io',
  apiUrl: process.env.API_URL || 'https://campus-food-ordering.onrender.com/api',
};

module.exports = config;
