const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
// Load .env for local/dev. In production (cPanel), do NOT override existing env.
(() => {
  const envPath = path.join(__dirname, '.env');
  try {
    require('dotenv').config({
      path: envPath,
      override: process.env.NODE_ENV !== 'production'
    });
  } catch {
    // dotenv is optional; ignore if missing
  }
})();

const { connectToMySQL, getDB, getPool } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyParameterRoutes = require('./routes/companyParameterRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const companyRoutes = require('./routes/companyRoutes');
const siteInfoRoutes = require('./routes/siteInfoRoutes');
const contentRoutes = require('./routes/contentRoutes');
const siteRoutes = require('./routes/siteRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');
const notFound = require('./middleware/errorMiddleware').notFound;

const app = express();
const PORT = process.env.PORT || 3001; // Port 3005

// Middleware
// Configure helmet to allow cross-origin embedding of static assets (images/resumes)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
  , 'http://localhost:5177'
];

const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without Origin (same-origin or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production when frontend and backend are same-origin, CORS isn't needed
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded files statically (local fallback for Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Basic health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'running',
    database: (() => { try { return getDB() ? 'Connected' : 'Disconnected'; } catch { return 'Disconnected'; } })()
  });
});

// Helpful root handlers so cPanel URL mapping can be verified easily
app.get('/', (req, res) => {
  res.json({ message: 'API root reachable', base: '/', timestamp: new Date().toISOString() });
});
app.get('/api', (req, res) => {
  res.json({ message: 'API base reachable', base: '/api', hint: 'Try /api/status for health', timestamp: new Date().toISOString() });
});

// Database status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const db = getDB();

    // Try pinging MySQL pool, but degrade gracefully if not available
    let serverConnected = false;
    let storageMode = 'memory';
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      serverConnected = true;
      storageMode = 'mysql';
    } catch {
      serverConnected = false;
      storageMode = 'memory';
    }

    // Get collection stats via adapter (works for both MySQL and memory)
    const stats = {
      users: await db.collection('users').countDocuments(),
      jobs: await db.collection('jobs').countDocuments(),
      companies: await db.collection('companies').countDocuments(),
      applications: await db.collection('applications').countDocuments()
    };
    
    res.json({
      status: serverConnected ? 'Connected' : 'Degraded',
      storageMode,
      database: process.env.MYSQL_DATABASE || process.env.MYSQL_DB_NAME || 'megajob_db',
      collections: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Duplicate status endpoint without '/api' for Passenger BaseURI setups
app.get('/status', async (req, res) => {
  try {
    const db = getDB();

    let serverConnected = false;
    let storageMode = 'memory';
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      serverConnected = true;
      storageMode = 'mysql';
    } catch {
      serverConnected = false;
      storageMode = 'memory';
    }

    const stats = {
      users: await db.collection('users').countDocuments(),
      jobs: await db.collection('jobs').countDocuments(),
      companies: await db.collection('companies').countDocuments(),
      applications: await db.collection('applications').countDocuments()
    };
    
    res.json({
      status: serverConnected ? 'Connected' : 'Degraded',
      storageMode,
      database: process.env.MYSQL_DATABASE || process.env.MYSQL_DB_NAME || 'megajob_db',
      collections: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// API Routes
// Mount routes at both '/api/*' and '/*' to work with Passenger BaseURI
app.use('/api/auth', authRoutes);        app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);       app.use('/users', userRoutes);
app.use('/api/jobs', jobRoutes);         app.use('/jobs', jobRoutes);
app.use('/api/employers', employerRoutes); app.use('/employers', employerRoutes);
app.use('/api/applications', applicationRoutes); app.use('/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);      app.use('/admin', adminRoutes);
app.use('/api/company-parameters', companyParameterRoutes); app.use('/company-parameters', companyParameterRoutes);
app.use('/api/resumes', resumeRoutes);   app.use('/resumes', resumeRoutes);
app.use('/api/companies', companyRoutes); app.use('/companies', companyRoutes);
app.use('/api/site-info', siteInfoRoutes); app.use('/site-info', siteInfoRoutes);
app.use('/api/content', contentRoutes);  app.use('/content', contentRoutes);
app.use('/api/site', siteRoutes);        app.use('/site', siteRoutes);

// New CMS endpoints for admin-managed UI sections
app.use('/api/about', require('./routes/about'));          app.use('/about', require('./routes/about'));
app.use('/api/contact', require('./routes/contact'));      app.use('/contact', require('./routes/contact'));
app.use('/api/categories', require('./routes/categories')); app.use('/categories', require('./routes/categories'));
app.use('/api/roles', require('./routes/roles'));          app.use('/roles', require('./routes/roles'));
app.use('/api/blogs', require('./routes/blogs'));          app.use('/blogs', require('./routes/blogs'));
app.use('/api/news', require('./routes/news'));            app.use('/news', require('./routes/news'));
app.use('/api/recruitment', require('./routes/recruitment')); app.use('/recruitment', require('./routes/recruitment'));
app.use('/api/updates', require('./routes/updates'));      app.use('/updates', require('./routes/updates'));
app.use('/api/video', require('./routes/video'));          app.use('/video', require('./routes/video'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/footer', require('./routes/footer'));

// 404 handler for API routes
app.use('/api/*', notFound);

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to MySQL first (or fall back to in-memory)
    await connectToMySQL();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 API status: http://localhost:${PORT}/api/status`);
      console.log(`📁 Static uploads: http://localhost:${PORT}/uploads/`);
      console.log(`🔗 CORS enabled for: http://localhost:3000, http://localhost:3001, http://localhost:3002, http://localhost:3003, http://localhost:3004, http://localhost:5173, http://localhost:5174, http://localhost:5175, http://localhost:5176`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();