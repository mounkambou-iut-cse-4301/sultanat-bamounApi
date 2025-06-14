

// // Start the server
// startServer();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');


const sequelize = require('./config/database');
const { Umzug, SequelizeStorage } = require('umzug');

const app = express();
const PORT = process.env.PORT || 3002;
app.use(cors({
  origin: '*'
}));
// ────────────────────────────────────────────────────────────────────────────────
// 1) Sécurité HTTP : headers et HSTS
// ────────────────────────────────────────────────────────────────────────────────
// app.use(helmet());
// app.use(
//   helmet.hsts({
//     maxAge: 31536000, // 1 an
//     includeSubDomains: true,
//   })
// );

// ────────────────────────────────────────────────────────────────────────────────
// 2) Rate limiting global
// ────────────────────────────────────────────────────────────────────────────────
// app.use(rateLimitMiddleware);

// ────────────────────────────────────────────────────────────────────────────────
// 3) Limites de taille pour le corps des requêtes (JSON et URL-encoded)
// ────────────────────────────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ────────────────────────────────────────────────────────────────────────────────
// 4) CORS strict (local + production) avec support PATCH
// ────────────────────────────────────────────────────────────────────────────────
// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'https://ton-frontend.com'
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error('CORS policy violation: Origin not allowed'));
//     },
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//   })
// );

// ────────────────────────────────────────────────────────────────────────────────
// 5) Documentation Swagger
// ────────────────────────────────────────────────────────────────────────────────
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ────────────────────────────────────────────────────────────────────────────────
// 6) Sécurisation des fichiers statiques
// ────────────────────────────────────────────────────────────────────────────────
app.use(
  '/images',
  express.static(path.join(__dirname, 'public/images'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1d',
  })
);

// ────────────────────────────────────────────────────────────────────────────────
// Route racine
// ────────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Bonjour depuis Node.js sur Vercel !');
});

// ────────────────────────────────────────────────────────────────────────────────
// Routes API
// ────────────────────────────────────────────────────────────────────────────────
app.use('/', contactRoutes);
app.use('/', newsletterRoutes);
app.use('/', bookRoutes);

app.use('/', reviewRoutes);

// ────────────────────────────────────────────────────────────────────────────────
// Gestion des erreurs
// ────────────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Non trouvé' });
});

// ────────────────────────────────────────────────────────────────────────────────
// Exécution des migrations Umzug + démarrage du serveur
// ────────────────────────────────────────────────────────────────────────────────
async function runMigrations() {
  const umzug = new Umzug({
    migrations: { glob: 'migrations/*.js' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations_meta' }),
    logger: console,
  });
  await umzug.up();
  console.log('✅ Migrations exécutées');
}

async function startServer() {
  try {
    await runMigrations();
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
    setInterval(async () => {
      try {
        await sequelize.query('SELECT 1');
        console.log('DB OK');
      } catch (e) {
        console.error('DB erreur :', e);
      }
    }, 60000);
     await sequelize.query('SELECT 1');

  } catch (e) {
    console.error('Erreur démarrage :', e);
    setTimeout(startServer, 3002);
  }
}

startServer();
