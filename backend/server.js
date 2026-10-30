const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Validate critical environment configurations
function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_in_production')) {
      throw new Error('[Security Error] Insecure or missing JWT_SECRET in production. Set a unique, cryptographically strong secret.');
    }
    if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.includes('nest_and_nova_cookie')) {
      throw new Error('[Security Error] Insecure or missing COOKIE_SECRET in production. Set a unique secret.');
    }
  }
}
validateEnvironment();

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');
const pincodeRoutes = require('./routes/pincode.routes');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.unsplash.com'],
        connectSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
    credentials: true
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'nest_and_nova_dev_cookie_secret_key_88291'));

// Rate Limiting
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this client. Please wait 15 minutes before retrying.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Serve Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes with Rate Limiting
app.use('/api', globalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiry', contactRoutes);
app.use('/api/pincode', pincodeRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'NEST & NOVA',
    tagline: 'Technology Meets Timeless Living',
    market: 'India',
    currency: 'INR',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling for API routes
app.use('/api', notFoundHandler);
app.use(errorHandler);

// HTML Fallback for Frontend Pages
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('File Not Found');
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server with Resilient Port Fallback and Database Initialization
async function startServer(portToTry = PORT) {
  try {
    await initializeDatabase();
  } catch (dbErr) {
    console.warn('[Database Notice]', dbErr.message);
  }

  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(portToTry) + 1;
      console.warn(`[Port Notice] Port ${portToTry} is currently in use. Automatically trying port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('[Server Fatal Error]', err);
    }
  });

  server.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`🌿 NEST & NOVA — Technology Meets Timeless Living`);
    console.log(`🚀 Production-Style Full-Stack E-Commerce Server`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`🔒 Security: Rate Limiting & Auth Hardening Active`);
    console.log(`💼 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

startServer();

module.exports = app;
