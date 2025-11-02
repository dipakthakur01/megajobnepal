const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { uploadImage, uploadCompanyLogo: uploadCompanyLogoMiddleware, uploadJobCover } = require('../utils/uploadHelper');
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  moderateJob,
  seedDatabase,
  analyzeJobCandidates,
  bulkAnalyzeJobs,
  exportCandidateCV,
  exportJobCandidates,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  approveCompany,
  sendPasswordChangeOtp,
  changePasswordWithOtp,
  changePassword,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  createJobByAdmin,
  updateJobByAdmin,
  deleteJobByAdmin,
  updateCompanyLogoByAdmin,
  updateJobCoverByAdmin,
  listAdminUsers,
  resetCompanies,
  listPermissionsCatalog,
  getUserPermissions,
  updateUserPermissions
} = require('../controllers/adminController');

// Job approval management endpoints
const {
  getAllJobsForAdmin,
  getPendingJobs,
  approveJob,
  rejectJob,
  updateJobTier,
  bulkApproveJobs,
  getJobStats
} = require('../controllers/adminJobController');

// All admin routes require authentication
router.use(authenticateToken);

// Dashboard and basic admin routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/jobs/:id/moderate', moderateJob);
// Admin job CRUD
router.post('/jobs', createJobByAdmin);
router.put('/jobs/:id', updateJobByAdmin);
router.delete('/jobs/:id', deleteJobByAdmin);
// Upload job cover image (multipart/form-data with field name 'cover')
router.post('/jobs/:id/upload-cover', uploadImage.single('cover'), uploadJobCover, updateJobCoverByAdmin);
router.post('/seed', seedDatabase);

// AI CV Analysis routes
router.get('/jobs/:jobId/analyze-candidates', analyzeJobCandidates);
router.post('/jobs/bulk-analyze', bulkAnalyzeJobs);

// CV Export routes
router.get('/candidates/:candidateId/applications/:applicationId/export', exportCandidateCV);
router.get('/jobs/:jobId/export-candidates', exportJobCandidates);

// Company management routes
router.get('/companies', adminController.getAllCompanies);
router.post('/companies', adminController.createCompany);
router.put('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);
router.post('/companies/:id/approve', adminController.approveCompany);
router.delete('/companies/reset', adminController.resetCompanies);
// NEW: Employers reset
router.delete('/employers/reset', adminController.resetEmployers);
// Upload company logo (super admin/admin)
router.post('/companies/:id/upload-logo', uploadImage.single('logo'), uploadCompanyLogoMiddleware, updateCompanyLogoByAdmin);
// NEW: Reset companies (super admin only)
router.delete('/companies/reset', requireRole('super_admin'), resetCompanies);

// Admin password change with OTP routes
router.post('/password/send-otp', sendPasswordChangeOtp);
router.post('/password/change-with-otp', changePasswordWithOtp);
// Admin password change without OTP (logged-in admin)
router.post('/password/change', changePassword);

// Super Admin - Staff management routes (protected)
router.post('/admin-users', requireRole('super_admin'), createAdminUser);
router.get('/admin-users', requireRole('super_admin'), listAdminUsers);
// Permissions management
router.get('/permissions', requireRole('super_admin'), listPermissionsCatalog);
router.get('/admin-users/:id/permissions', requireRole('super_admin'), getUserPermissions);
router.patch('/admin-users/:id/permissions', requireRole('super_admin'), updateUserPermissions);

// Compatibility: some clients send PATCH instead of PUT
router.patch('/admin-users/:id', requireRole('super_admin'), updateAdminUser);
router.patch('/users/:id/status', requireRole('super_admin'), updateUserStatus);
router.patch('/users/:id/role', requireRole('super_admin'), updateUserRole);
router.delete('/admin-users/:id', requireRole('super_admin'), deleteAdminUser);

router.post('/users/:id/reset-password', requireRole('super_admin'), resetUserPassword);

// Job approval management routes
router.get('/jobs/all', getAllJobsForAdmin);
router.get('/jobs/pending', getPendingJobs);
router.get('/jobs/stats', getJobStats);
router.put('/jobs/:jobId/approve', approveJob);
router.put('/jobs/:jobId/reject', rejectJob);
router.put('/jobs/:jobId/tier', updateJobTier);
router.post('/jobs/bulk-approve', bulkApproveJobs);

module.exports = router;