'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('categories', {
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
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('income', 'expense'),
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING(50),
                defaultValue: 'default'
            },
            color: {
                type: Sequelize.STRING(7),
                defaultValue: '#6366f1'
            },
            is_default: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
        await queryInterface.addIndex('categories', ['user_id']);
        await queryInterface.addIndex('categories', ['user_id', 'name', 'type'], {
            unique: true,
            where: { deleted_at: null },
            name: 'unique_category_per_user'
        });
        await queryInterface.addIndex('categories', ['deleted_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories');
    }
};
