const { sequelize } = require('../config/database');
const Category = require('./category.model');
const Transaction = require('./transaction.model');

const db = {
    sequelize,
    Category,
    Transaction
};

module.exports = db;
