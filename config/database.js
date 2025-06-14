// config/DB.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

// MYSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logging if desired
});

module.exports = sequelize;
