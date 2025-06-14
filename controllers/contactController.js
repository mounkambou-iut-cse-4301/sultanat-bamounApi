const transporter = require('../utils/mailer');
// controllers/teacher.controller.js
const { Op, fn, col, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
const ContactMessage = require('../models/ContactMessage');

exports.sendMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const newMessage = await ContactMessage.create({ first_name:firstName, last_name:lastName, email, phone, message });

    const mailOptions = {
      from: `"Sultanat Bamoun" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Confirmation de réception',
      text: `Bonjour ${firstName} ${lastName},\n\nNous avons reçu votre message:\n\n"${message}"\n\nNous vous contacterons bientôt.`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: `Message envoyé à ${email}`,
      contact_message_id: newMessage.id // Optionnel si `id` existe
    });

  } catch (error) {
    console.error('❌ Erreur envoi message:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation.',
        details: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
  exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
