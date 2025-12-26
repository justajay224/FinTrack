// Database Connection Test Script
// Run with: node test-db.js

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
    console.log('Testing MySQL connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);

    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3307,
            dialect: 'mysql',
            logging: console.log
        }
    );

    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connection successful!');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ MySQL Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
