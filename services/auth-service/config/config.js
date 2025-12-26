require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        seederStorage: 'sequelize',
        migrationStorageTableName: 'sequelize_migrations',
        seederStorageTableName: 'sequelize_seeds'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        seederStorage: 'sequelize'
    }
};
