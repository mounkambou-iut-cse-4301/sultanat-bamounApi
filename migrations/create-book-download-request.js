'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('book_download_requests', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      profession: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('book_download_requests');
  }
};
