'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Default categories for user_id = 1 (first registered user)
        const defaultCategories = [
            // Income categories
            { user_id: 1, name: 'Gaji', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Bonus', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Investasi', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Freelance', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Hadiah', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Lainnya', type: 'income', is_default: true, created_at: new Date(), updated_at: new Date() },

            // Expense categories
            { user_id: 1, name: 'Makanan & Minuman', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Transportasi', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Belanja', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Tagihan & Utilitas', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Hiburan', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Kesehatan', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Pendidikan', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Olahraga', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Pakaian', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Rumah Tangga', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() },
            { user_id: 1, name: 'Lainnya', type: 'expense', is_default: true, created_at: new Date(), updated_at: new Date() }
        ];

        await queryInterface.bulkInsert('categories', defaultCategories);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('categories', { is_default: true });
    }
};
