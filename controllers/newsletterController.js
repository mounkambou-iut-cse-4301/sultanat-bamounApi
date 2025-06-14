const transporter = require('../utils/mailer');
// controllers/teacher.controller.js
const { Op, fn, col, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

exports.subscribe = async (req, res) => {
  const { name, surname, email, phone, domain } = req.body;

  try {
    await NewsletterSubscriber.create({ name, surname, email, phone, domain });

    const mailOptions = {
      from: `"Sultanat Bamoun" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Newsletter - Sultanat Bamoun",
      text: `Félicitations ${name} ${surname} !\n\nVous êtes abonné à notre newsletter.\n\nDétails :\nEmail: ${email}\nTéléphone: ${phone}\nDomaine: ${domain}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: `Confirmation envoyée à ${email}` });
  } catch (error) {
    console.error('❌ Erreur abonnement:', error);
    
    const status = error.name === 'SequelizeUniqueConstraintError' 
      ? 409 
      : 500;
    
    res.status(status).json({ 
      error: status === 409 
        ? 'Cet email est déjà inscrit' 
        : 'Erreur lors de l\'abonnement' 
    });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('❌ Erreur récupération abonnés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { name, surname, email, phone, domain } = req.body;

    if (!name || !surname || !email || !phone || !domain) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const newSubscriber = await NewsletterSubscriber.create({ name, surname, email, phone, domain });

    const mailOptions = {
      from: `"Sultanat Bamoun" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Newsletter - Sultanat Bamoun",
      text: `Félicitations ${name} ${surname} !\n\nVous êtes abonné à notre newsletter.\n\nDétails :\nEmail: ${email}\nTéléphone: ${phone}\nDomaine: ${domain}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: `Confirmation envoyée à ${email}`,
      subscriber_id: newSubscriber.id // optionnel
    });

  } catch (error) {
    console.error("❌ Erreur abonnement newsletter:", error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "Cet email est déjà inscrit." });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Erreur de validation.",
        details: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(subscribers);
  } catch (error) {
    console.error('❌ Erreur récupération abonnés:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
