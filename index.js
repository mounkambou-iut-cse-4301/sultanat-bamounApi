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

// ────────────────────────────────────────────────────────────────────────────────
// 1) Configuration CORS complète
// ────────────────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
   'http://localhost:3000',
  'https://internet.cm',
  'https://histoire.internet.cm',
  'http://histoire.internet.cm',
  'https://sultanat-bamoun.alshadows.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors());

// ────────────────────────────────────────────────────────────────────────────────
// 2) Sécurité HTTP : headers et HSTS
// ────────────────────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "cdn.example.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  })
);

// ────────────────────────────────────────────────────────────────────────────────
// 3) Limites de taille pour le corps des requêtes
// ────────────────────────────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ────────────────────────────────────────────────────────────────────────────────
// 4) Sécurisation des fichiers statiques
// ────────────────────────────────────────────────────────────────────────────────
app.use(
  '/images',
  express.static(path.join(__dirname, 'public/images'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1d',
    setHeaders: (res, path) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

// ────────────────────────────────────────────────────────────────────────────────
// Route racine
// ────────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('API Sultanat Bamoun - Histoire de l\'Internet au Cameroun');
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
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);

  if (err.message.includes('CORS policy')) {
    return res.status(403).json({
      error: 'Accès interdit par la politique CORS',
      details: err.message
    });
  }

  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ────────────────────────────────────────────────────────────────────────────────
// Exécution des migrations Umzug + démarrage du serveur
// ────────────────────────────────────────────────────────────────────────────────
async function runMigrations() {
  try {
    const umzug = new Umzug({
      migrations: { glob: 'migrations/*.js' },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize,
        tableName: 'migrations_meta'
      }),
      logger: console,
    });

    const pending = await umzug.pending();
    console.log(`Migrations en attente: ${pending.length}`);

    await umzug.up();
    console.log('✅ Migrations exécutées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données');

    await runMigrations();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
    });

    setInterval(async () => {
      try {
        await sequelize.query('SELECT 1');
        console.log('🔄 Keep-alive DB OK');
      } catch (e) {
        console.error('❌ DB erreur :', e);
      }
    }, 60000);

  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    setTimeout(startServer, 10000);
  }
}

startServer();
