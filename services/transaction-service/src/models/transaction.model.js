const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Category = require('./category.model');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: { msg: 'Amount must be a valid number' },
            min: { args: [0.01], msg: 'Amount must be greater than 0' }
        }
    },
    notes: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Invalid date format' }
        }
    }
}, {
    tableName: 'transactions',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['transaction_date'] },
        { fields: ['type'] }
    ]
});

// Define association
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' });

module.exports = Transaction;
