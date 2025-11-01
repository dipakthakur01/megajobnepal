// Environment helper for Vite
function getEnv() {
  // In Vite, we use import.meta.env for client-side environment variables
  // Client-side environment variables must be prefixed with VITE_
  return import.meta.env || {};
}

const envVars = getEnv();

export const env = {
  // Database configuration
  // Prefer MySQL variables; keep PostgreSQL/MongoDB for legacy fallback
  MYSQL_URL: envVars.VITE_MYSQL_URL || envVars.VITE_API_URL || "http://localhost:3001/api",
  MYSQL_DB_NAME: envVars.VITE_MYSQL_DB_NAME || envVars.VITE_MYSQL_DATABASE || "megajobnepal",
  // Prefer PostgreSQL variables; keep MongoDB for legacy fallback
  POSTGRES_URL: envVars.VITE_POSTGRES_URL || envVars.VITE_API_URL || "http://localhost:3001/api",
  POSTGRES_DB_NAME: envVars.VITE_POSTGRES_DB_NAME || envVars.VITE_MONGODB_DB_NAME || "megajobnepal",
  MONGODB_URI: envVars.VITE_MONGODB_URI || "mongodb://localhost:27017",
  MONGODB_DB_NAME: envVars.VITE_MONGODB_DB_NAME || "megajobnepal",
  
  // General configuration
  NODE_ENV: envVars.NODE_ENV || "development",
  
  // Application configuration
  APP_NAME: envVars.VITE_APP_NAME || "MegaJobNepal",
  APP_URL: envVars.VITE_APP_URL || "http://localhost:3000",
  
  // File upload configuration (you might want to use a service like Cloudinary or AWS S3)
  UPLOAD_SERVICE: envVars.NEXT_PUBLIC_UPLOAD_SERVICE || envVars.UPLOAD_SERVICE || "local",
  CLOUDINARY_CLOUD_NAME: envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || envVars.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.NEXT_PUBLIC_CLOUDINARY_API_KEY || envVars.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET, // Server-side only
  
  // Email configuration (for OTP and notifications)
  SMTP_HOST: envVars.SMTP_HOST,
  SMTP_PORT: envVars.SMTP_PORT,
  SMTP_USER: envVars.SMTP_USER,
  SMTP_PASS: envVars.SMTP_PASS,
  
  // JWT configuration
  JWT_SECRET: envVars.JWT_SECRET || "your-jwt-secret-change-in-production",
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN || "7d",
};

export default env
