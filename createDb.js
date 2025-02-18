const mysql = require('mysql2');
require('dotenv').config(); // Pour charger les variables d'environnement

// Créer une connexion à la base de données MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST, // Hôte de la base de données
    user: process.env.DB_USER, // Utilisateur de la base de données
    password: process.env.DB_PASS // Mot de passe de la base de données
});

// Connectez-vous à MySQL
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connexion à la base de données réussie.');

    // Créer la base de données
    connection.query('CREATE DATABASE IF NOT EXISTS culture_bamoun', (err, results) => {
        if (err) {
            console.error('Erreur lors de la création de la base de données:', err);
            return;
        }
        console.log('Base de données créée ou déjà existante.');

        // Utiliser la base de données
        connection.query('USE culture_bamoun', (err, results) => {
            if (err) {
                console.error('Erreur lors de la sélection de la base de données:', err);
                return;
            }

            // Créer la table newsletter_subscribers
            const createNewsletterTable = `
                CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    surname VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    phone VARCHAR(255) NOT NULL,
                    domain VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;

            connection.query(createNewsletterTable, (err, results) => {
                if (err) {
                    console.error('Erreur lors de la création de la table newsletter_subscribers:', err);
                    return;
                }
                console.log('Table newsletter_subscribers créée.');

                // Créer la table contact_messages
                const createContactMessagesTable = `
                    CREATE TABLE IF NOT EXISTS contact_messages (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        first_name VARCHAR(255) NOT NULL,
                        last_name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        phone VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;

                connection.query(createContactMessagesTable, (err, results) => {
                    if (err) {
                        console.error('Erreur lors de la création de la table contact_messages:', err);
                        return;
                    }
                    console.log('Table contact_messages créée.');

                    // Fermer la connexion
                    connection.end();
                });
            });
        });
    });
});