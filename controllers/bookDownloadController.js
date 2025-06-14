const path = require('path');
const transporter = require('../utils/mailer');
const BookDownloadRequest = require('../models/BookDownloadRequest');

exports.requestDownload = async (req, res) => {
  try {
    const { name, email, phone, country, city, address, profession } = req.body;

    // Vérification des champs requis
    if (!name || !email || !phone || !country || !city || !address || !profession) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Enregistrement dans la base
    const request = await BookDownloadRequest.create({
      name,
      email,
      phone,
      country,
      city,
      address,
      profession
    });

    // Chemin vers le livre PDF
    const bookPath = path.join(__dirname, '../assets/books/HISTOIRE_DE_L_INTERNET_AU_CAMEROUN_VERSION_3_09062025.pdf');

    // Contenu de l’email
    const mailOptions = {
      from: `"Internet.cm" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Téléchargement du livre – Histoire de l'Internet au Cameroun",
      text: `Bonjour ${name},

Nous vous remercions pour votre intérêt.

Veuillez trouver en pièce jointe le livre que vous avez demandé. Ce document retrace l’histoire de l’Internet au Cameroun, ses débuts, ses évolutions et son impact sur notre société.

Chez Internet.cm, nous croyons que l’accès à l’information est essentiel pour bâtir une société numérique forte, inclusive et durable. Ce livre fait partie de notre initiative pour documenter et partager notre patrimoine numérique.

Si vous avez des questions ou souhaitez en savoir plus, n’hésitez pas à nous contacter.

Bien cordialement,  
L’équipe Internet.cm

📧 info@internet.cm  
🌍 www.internet.cm`,
      attachments: [
        {
          filename: 'HISTOIRE_DE_L_INTERNET_AU_CAMEROUN_VERSION_3_09062025.pdf',
          path: bookPath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Envoi de l’e-mail
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: `Livre envoyé à ${email}`,
      request_id: request.id
    });

  } catch (error) {
    console.error('❌ Erreur envoi email de téléchargement :', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Erreur de validation.",
        details: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
exports.getAllDownloadRequests = async (req, res) => {
  try {
    const requests = await BookDownloadRequest.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('❌ Erreur récupération demandes:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
