const Review = require('../models/Review');

// POST - Créer un avis ou une réponse
exports.createReview = async (req, res) => {
  try {
    const { name, email, content, parent_id } = req.body;
const book_title="Histoire de l'Internet au Cameroun"
    if (parent_id) {
      const parent = await Review.findByPk(parent_id);
      if (!parent || parent.parent_id) {
        return res.status(400).json({ message: "Invalid parent_id: soit inexistant, soit c’est déjà un reply." });
      }
    }

    const review = await Review.create({ name, email, content, book_title, parent_id });
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'avis." });
  }
};

// GET - Récupérer tous les avis et leurs réponses
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { parent_id: null },
      include: [{
        model: Review,
        as: 'replies'
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des avis." });
  }
};
