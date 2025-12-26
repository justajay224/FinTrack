'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transactions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            type: {
                type: Sequelize.ENUM('income', 'expense'),
                allowNull: false
            },
            amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            notes: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            transaction_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Add indexes
        await queryInterface.addIndex('transactions', ['user_id']);
        await queryInterface.addIndex('transactions', ['transaction_date']);
        await queryInterface.addIndex('transactions', ['type']);
        await queryInterface.addIndex('transactions', ['deleted_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('transactions');
    }
};
