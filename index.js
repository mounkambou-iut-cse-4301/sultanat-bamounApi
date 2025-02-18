const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { sequelize, connectDatabase } = require('./db'); // Importer la fonction de connexion
const { DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();

// Définir les modèles
const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    domain: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

const ContactMessage = sequelize.define('ContactMessage', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false }
}, { timestamps: true });

// Synchroniser les modèles avec la base de données
sequelize.sync();

// Vérification de la connexion à la base de données
connectDatabase().catch(err => {
    console.error('Erreur lors de la connexion à la base de données, le serveur ne peut pas démarrer:', err);
    process.exit(1);
});

// Configurer le transporteur de messagerie
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Endpoint pour la confirmation de l'abonnement à la newsletter
app.post("/send-news-letter-confirmation", async (req, res) => {
    const { name, surname, email, phone, domain } = req.body;

    try {
        await connectDatabase(); // Vérifier la connexion
        await NewsletterSubscriber.create({ name, surname, email, phone, domain });

        const mailOptions = {
            from: `"Sultanat Bamoun" <${process.env.SMTP_USER}>`, // Nom personnalisé
            to: email,
            replyTo: process.env.SMTP_USER_REPLY_TO,
            subject: "Newsletter - Culture Bamoun",
            text: `Félicitations, ${name} ${surname}! Vous venez de vous abonner à la newsletter de Culture Bamoun.\n\n` +
                  `Voici les détails de votre abonnement :\n` +
                  `Email: ${email}\n` +
                  `Téléphone: ${phone}\n` +
                  `Nom de domaine: ${domain}\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send("E-mail envoyé : " + mailOptions.to);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail ou de l\'enregistrement en base de données:', error);
        res.status(500).send('Erreur lors de l\'envoi de l\'e-mail ou de l\'enregistrement.');
    }
});

// Endpoint pour le message de contact
app.post('/send-contact-message', async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
        return res.status(400).send('Tous les champs sont requis.');
    }

    try {
        await connectDatabase(); // Vérifier la connexion
        await ContactMessage.create({ firstName, lastName, email, phone, message });

        const mailOptions = {
            from: `"Sultanat Bamoun" <${process.env.SMTP_USER}>`, // Nom personnalisé
            to: email,
            replyTo: process.env.SMTP_USER_REPLY_TO,
            subject: 'Confirmation de réception du formulaire de contact',
            text: `Bonjour ${firstName} ${lastName},\n\nNous avons bien reçu votre message. Voici les détails:\n\n` +
                  `Nom: ${firstName} ${lastName}\n` +
                  `Email: ${email}\n` +
                  `Téléphone: ${phone}\n` +
                  `Message: ${message}\n\n` +
                  `Nous vous contacterons dès que possible.\n\nMerci pour votre message !`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Message envoyé : ' + mailOptions.to);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message ou de l\'enregistrement en base de données:', error);
        res.status(500).send('Erreur lors de l\'envoi du message ou de l\'enregistrement.');
    }
});

// API pour récupérer tous les abonnés à la newsletter
app.get('/subscribers', async (req, res) => {
    try {
        await connectDatabase(); // Vérifier la connexion
        const subscribers = await NewsletterSubscriber.findAll();
        res.status(200).json(subscribers);
    } catch (error) {
        console.error('Erreur lors de la récupération des abonnés:', error);
        res.status(500).send('Erreur lors de la récupération des abonnés.');
    }
});

// API pour récupérer tous les messages de contact
app.get('/contact-messages', async (req, res) => {
    try {
        await connectDatabase(); // Vérifier la connexion
        const messages = await ContactMessage.findAll();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        res.status(500).send('Erreur lors de la récupération des messages.');
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});