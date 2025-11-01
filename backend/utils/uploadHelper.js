const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for documents (resumes)
const documentFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed!'), false);
  }
};

// Multer upload configurations
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload to Cloudinary
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET ||
        process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      reject(new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'));
      return;
    }

    const uploadOptions = {
      resource_type: 'auto',
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Local file upload fallback
const uploadToLocal = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const fileExtension = options.originalname ? path.extname(options.originalname) : '.jpg';
      const fileName = crypto.randomUUID() + fileExtension;

      // Normalize and validate folder
      const allowed = new Set(['profile-images', 'resumes', 'company-logos', 'company-banners', 'hero-images']);
      const targetFolder = allowed.has(options.folder) ? options.folder : 'profile-images';

      const uploadDir = path.join('uploads', targetFolder);
      const fullPath = path.join(__dirname, '..', uploadDir, fileName);

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, buffer);

      const port = process.env.PORT || 3001; // keep in sync with server.js default
      const baseUrl = `http://localhost:${port}`;
      const publicPath = `/uploads/${targetFolder}/${fileName}`;
      const result = {
        public_id: fileName.split('.')[0],
        secure_url: `${baseUrl}${publicPath}`,
        url: `${baseUrl}${publicPath}`,
        original_filename: options.originalname || fileName,
        bytes: buffer.length,
        format: fileExtension.slice(1)
      };

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Upload profile image
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let result;
    
    // Try Cloudinary first, fallback to local storage
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        folder: 'profile_images',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
    } catch (cloudinaryError) {
      console.log('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      
      // Use local upload as fallback
      result = await uploadToLocal(req.file.buffer, {
        folder: 'profile-images',
        originalname: req.file.originalname
      });
    }

    req.uploadResult = result;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Upload company logo
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let result;

    // Try Cloudinary first, fallback to local storage
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        folder: 'company_logos',
        transformation: [
          { width: 200, height: 200, crop: 'fit' },
          { quality: 'auto' }
        ]
      });
    } catch (cloudinaryError) {
      console.log('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      
      // Use local upload as fallback
      result = await uploadToLocal(req.file.buffer, {
        folder: 'company-logos',
        originalname: req.file.originalname
      });
    }

    req.uploadResult = result;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Upload company banner
const uploadCompanyBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let result;

    // Try Cloudinary first, fallback to local storage
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        folder: 'company_banners',
        transformation: [
          { width: 1600, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
    } catch (cloudinaryError) {
      console.log('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      // Use local upload as fallback
      result = await uploadToLocal(req.file.buffer, {
        folder: 'company-banners',
        originalname: req.file.originalname
      });
    }

    req.uploadResult = result;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
// Upload job cover image
const uploadJobCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let result;

    // Try Cloudinary first, fallback to local storage
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        folder: 'job_covers',
        transformation: [
          // Wider aspect for hero/cover display
          { width: 1600, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
    } catch (cloudinaryError) {
      console.log('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      // Use local upload as fallback (served at /uploads/hero-images)
      result = await uploadToLocal(req.file.buffer, {
        folder: 'hero-images',
        originalname: req.file.originalname
      });
    }

    req.uploadResult = result;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
// Upload resume (Cloudinary with local fallback)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let result;

    // Try Cloudinary first, fallback to local storage
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        folder: 'resumes',
        resource_type: 'raw'
      });
    } catch (cloudinaryError) {
      console.log('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      result = await uploadToLocal(req.file.buffer, {
        folder: 'resumes',
        originalname: req.file.originalname
      });
    }

    req.uploadResult = result;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = {
  uploadImage,
  uploadDocument,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadProfileImage,
  uploadCompanyLogo,
  uploadCompanyBanner,
  uploadResume,
  // Export job cover uploader if defined below
  uploadJobCover
};