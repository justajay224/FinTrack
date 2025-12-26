'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Use raw SQL to remove columns (more compatible with MariaDB)
        await queryInterface.sequelize.query('ALTER TABLE categories DROP COLUMN icon');
        await queryInterface.sequelize.query('ALTER TABLE categories DROP COLUMN color');
    },

    async down(queryInterface, Sequelize) {
        // Add back icon and color columns
        await queryInterface.sequelize.query("ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT 'default'");
        await queryInterface.sequelize.query("ALTER TABLE categories ADD COLUMN color VARCHAR(7) DEFAULT '#6366f1'");
    }
};
