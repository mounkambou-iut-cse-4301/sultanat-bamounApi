const path = require('path');
const transporter = require('../utils/mailer');
const BookDownloadRequest = require('../models/BookDownloadRequest');
const fs = require('fs');


const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// exports.requestDownload = async (req, res) => {
//   try {
//     const { name, email, phone, country, city, address, profession } = req.body;

//     // Vérification des champs requis
//     if (!name || !email || !phone || !country || !city || !address || !profession) {
//       return res.status(400).json({ message: "Tous les champs sont requis." });
//     }

//     // Enregistrement dans la base
//     const request = await BookDownloadRequest.create({
//       name,
//       email,
//       phone,
//       country,
//       city,
//       address,
//       profession
//     });

//     // Chemin vers le livre PDF
//     const bookPath = path.join(__dirname, '../assets/books/HISTOIRE_DE_L_INTERNET_AU_CAMEROUN_VERSION_4_10072025.pdf');

//     // Contenu de l’email
//     const mailOptions = {
//       from: `"Internet.cm" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Téléchargement du livre – Histoire de l'Internet au Cameroun",
//       text: `Bonjour ${name},

// Nous vous remercions pour votre intérêt.

// Veuillez trouver en pièce jointe le livre que vous avez demandé. Ce document retrace l’histoire de l’Internet au Cameroun, ses débuts, ses évolutions et son impact sur notre société.

// Chez Internet.cm, nous croyons que l’accès à l’information est essentiel pour bâtir une société numérique forte, inclusive et durable. Ce livre fait partie de notre initiative pour documenter et partager notre patrimoine numérique.

// Si vous avez des questions ou souhaitez en savoir plus, n’hésitez pas à nous contacter.

// Bien cordialement,  
// L’équipe Internet.cm

// 📧 info@internet.cm  
// 🌍 www.internet.cm`,
//       attachments: [
//         {
//           filename: 'HISTOIRE_DE_L_INTERNET_AU_CAMEROUN_VERSION_4_10072025.pdf',
//           path: bookPath,
//           contentType: 'application/pdf'
//         }
//       ]
//     };

//     // Envoi de l’e-mail
//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       message: `Livre envoyé à ${email}`,
//       request_id: request.id
//     });

//   } catch (error) {
//     console.error('❌ Erreur envoi email de téléchargement :', error);

//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         message: "Erreur de validation.",
//         details: error.errors.map(e => e.message)
//       });
//     }

//     return res.status(500).json({ message: "Erreur interne du serveur." });
//   }
// };
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


exports.requestDownload = async (req, res) => {
  try {
    const { name, email, phone, country, city, address, profession } = req.body;

    // Vérification des champs obligatoires
    if (!name || !email || !phone || !country || !city || !address || !profession) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Génération du numéro de série unique
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const serialNumber = `SN-${datePart}-${randomPart}`;

    // Enregistrement dans la base de données
    const request = await BookDownloadRequest.create({
      name,
      email,
      phone,
      country,
      city,
      address,
      profession,
      serial_number:serialNumber
    });

    // Chemin du PDF original
    const originalPdfPath = path.join(__dirname, '../assets/books/HISTOIRE_DE_L_INTERNET_AU_CAMEROUN_VERSION_4_10072025.pdf');
    
    // Vérification de l'existence du fichier PDF
    if (!fs.existsSync(originalPdfPath)) {
      console.error("❌ Fichier PDF introuvable :", originalPdfPath);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    // Lecture du PDF original
    const pdfBytes = fs.readFileSync(originalPdfPath);

    // Création d'une copie modifiable
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // Vérifier qu'il y a au moins 2 pages
    if (pages.length < 2) {
      throw new Error("Le PDF doit contenir au moins 2 pages");
    }

    // Prendre la deuxième page (index 1)
    const secondPage = pages[1];
    const { width, height } = secondPage.getSize();
    const currentDate = new Date().toLocaleString("fr-FR", { timeZone: 'Africa/Douala' });

    // Utiliser seulement la police italique (sans gras)
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const footerText = 
      `\nTéléchargé par : ${name}\n` +
      `Date de téléchargement : ${currentDate}\n` +
      `Numéro Utilisateur : ${serialNumber}`;

    // Ajouter le texte en bas de la deuxième page
    secondPage.drawText(footerText, {
      x: 50,
      y: 40,
      size: 9,
      font: italicFont,
      color: rgb(0.4, 0.4, 0.4), // Gris (couleur originale)
      lineHeight: 11,
    });

    // Sauvegarde du PDF temporaire
    const modifiedPdfBytes = await pdfDoc.save();
    
    // Création du dossier temp s'il n'existe pas
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Utilisation d'un nom de fichier unique avec timestamp
    const tempFileName = `book_${Date.now()}_${request.id}.pdf`;
    const tempPath = path.join(tempDir, tempFileName);
    fs.writeFileSync(tempPath, modifiedPdfBytes);

    // Configuration de l'email
    const mailOptions = {
      from: `"Internet.cm" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Téléchargement du livre – Histoire de l'Internet au Cameroun",
      text: `Bonjour ${name},

Veuillez trouver en pièce jointe le livre personnalisé que vous avez demandé.
Cordialement,  
L’équipe Internet.cm`,
      attachments: [
        {
          filename: 'HISTOIRE_DE_L_INTERNET_PERSONNALISÉ.pdf',
          path: tempPath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Suppression du fichier temporaire avec gestion d'erreur
    fs.unlink(tempPath, (err) => {
      if (err) {
        console.error("❌ Erreur lors de la suppression du fichier temporaire:", err);
      }
    });

    return res.status(200).json({
      message: `Livre envoyé à ${email}`,
      request_id: request.id,
      serial_number: serialNumber
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du livre par email :', error);
    return res.status(500).json({ 
      message: "Erreur interne du serveur.",
      error: error.message
    });
  }
};