const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Category name is required' },
            len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
        }
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
        validate: {
            isIn: { args: [['income', 'expense']], msg: 'Type must be income or expense' }
        }
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'categories',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'name', 'type'],
            where: { deleted_at: null }
        }
    ]
});

module.exports = Category;
