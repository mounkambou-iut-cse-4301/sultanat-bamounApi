// // config/database.js

// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// // MYSQL
// const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
//     host: process.env.DATABASE_HOST,
//     dialect: 'mysql',
//     logging: false, // Disable logging if desired
// });

// module.exports = sequelize;
// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Désactive les logs SQL si vous le souhaitez

    // ———————— CONFIGURATION DU POOL ————————
    pool: {
      max: 20,         // nombre maximum de connexions simultanées
      min: 2,          // nombre minimum
      acquire: 30000, // temps max d’attente pour obtenir une connexion (en ms)
      idle: 10000      // temps max avant qu’une connexion inactive soit libérée (en ms)
    },

    // Optionnel : si vous ne voulez pas de timestamps auto sur tous vos modèles
    define: {
      timestamps: false
    }
  }
);

module.exports = sequelize;
