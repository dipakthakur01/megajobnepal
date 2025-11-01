const { getDB } = require('../config/db');
const { uploadToCloudinary, deleteFromCloudinary, uploadProfileImage: uploadProfileImageHelper } = require('../utils/uploadHelper');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const db = getDB();
    
    const user = await db.collection('users').findOne(
      { _id: req.user.userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { 
      full_name, 
      phone, 
      address, 
      skills, 
      experience, 
      education,
      bio,
      linkedin,
      github,
      website,
      location,
      jobTitle,
      expectedSalary,
      availability
    } = req.body;
    const db = getDB();

    const updateData = {
      updated_at: new Date()
    };

    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (skills) updateData.skills = skills;
    if (experience) updateData.experience = experience;
    if (education) updateData.education = education;
    if (bio) updateData.bio = bio;
    if (linkedin) updateData.linkedin = linkedin;
    if (github) updateData.github = github;
    if (website) updateData.website = website;
    if (location) updateData.location = location;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (expectedSalary) updateData.expectedSalary = expectedSalary;
    if (availability) updateData.availability = availability;

    const result = await db.collection('users').updateOne(
      { _id: req.user.userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: req.user.userId },
      { projection: { password: 0 } }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload profile image - handler after middleware
const uploadProfileImageHandler = async (req, res) => {
  try {
    const db = getDB();
    
    // Get the upload result from middleware
    const result = req.uploadResult;
    
    if (!result) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    // Get current user to check for existing profile image
    const currentUser = await db.collection('users').findOne(
      { _id: req.user.userId },
      { projection: { profileImage: 1 } }
    );

    // Delete old profile image if exists (only for Cloudinary images)
    if (currentUser?.profileImage && currentUser.profileImage.includes('cloudinary')) {
      try {
        // Extract public_id from cloudinary URL
        const urlParts = currentUser.profileImage.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteFromCloudinary(`profile_images/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting old profile image:', deleteError);
      }
    }

    // Update user profile with new image URL
    const updateResult = await db.collection('users').updateOne(
      { _id: req.user.userId },
      { 
        $set: { 
          profileImage: result.secure_url,
          updated_at: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    const db = getDB();
    
    // Get current user to check for existing resume
    const currentUser = await db.collection('users').findOne(
      { _id: req.user.userId },
      { projection: { resume: 1 } }
    );

    // Delete old resume if exists
    if (currentUser?.resume) {
      try {
        const oldUrl = currentUser.resume;
        if (oldUrl.includes('cloudinary')) {
          // Extract public_id from cloudinary URL
          const urlParts = oldUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          await deleteFromCloudinary(`resumes/${publicId}`);
        } else if (oldUrl.includes('/uploads/resumes/')) {
          // Delete local file
          const path = require('path');
          const fs = require('fs');
          const fileName = oldUrl.split('/uploads/resumes/')[1];
          if (fileName) {
            const fullPath = path.join(__dirname, '..', 'uploads', 'resumes', fileName);
            if (fs.existsSync(fullPath)) {
              try { fs.unlinkSync(fullPath); } catch (e) { console.warn('Failed to delete local resume:', e.message); }
            }
          }
        }
      } catch (deleteError) {
        console.error('Error deleting old resume:', deleteError);
      }
    }

    // Use upload result from middleware (Cloudinary or local)
    const result = req.uploadResult;
    if (!result) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    const resumeUrl = result.secure_url || result.url;

    // Update user profile with new resume URL
    const updateResult = await db.collection('users').updateOne(
      { _id: req.user.userId },
      { 
        $set: { 
          resume: resumeUrl,
          resumeFileName: req.file.originalname,
          updated_at: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage: uploadProfileImageHandler,
  uploadResume
};