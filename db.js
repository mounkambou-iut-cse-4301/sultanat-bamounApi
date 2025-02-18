// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
});

async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données établie avec succès.');
    } catch (error) {
        console.error('Impossible de se connecter à la base de données:', error);
        throw error;
    }
}

module.exports = {
    sequelize,
    connectDatabase
};