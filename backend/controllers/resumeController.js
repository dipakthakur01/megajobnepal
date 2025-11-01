const { getDB } = require('../config/db');
const { validateResume, validateResumeUpdate, generateShareToken: makeShareToken, createDefaultResume } = require('../models/Resume');
const PDFDocument = require('pdfkit');
// Enable DOCX export using the docx library
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

// Get all resumes for a user
const getUserResumes = async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.userId;

    const resumes = await db.collection('resumes')
      .find({ userId: userId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: resumes,
      count: resumes.length
    });
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message
    });
  }
};

// Get a specific resume by ID
const getResumeById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user.userId;

    const resume = await db.collection('resumes').findOne({
      _id: id,
      userId: userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: error.message
    });
  }
};

// Create a new resume
const createResume = async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.userId;
    const resumeData = req.body;

    // Get user profile for auto-fill
    const userProfile = await db.collection('users').findOne({
      _id: userId
    });

    // Create default resume or use provided data
    const newResume = resumeData.title ? 
      { ...resumeData, userId: userId } : 
      createDefaultResume(userId, userProfile);

    // Validate resume data
    const validation = validateResume(newResume);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check resume limit (max 5 resumes per user)
    const resumeCount = await db.collection('resumes').countDocuments({
      userId: userId
    });

    if (resumeCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum resume limit reached (5 resumes per user)'
      });
    }

    const result = await db.collection('resumes').insertOne(newResume);

    const createdResume = await db.collection('resumes').findOne({
      _id: result.insertedId
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: createdResume
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resume',
      error: error.message
    });
  }
};

// Update a resume
const updateResume = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Ensure ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    // Validate update data
    const validation = validateResumeUpdate(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    const result = await db.collection('resumes').updateOne(
      { 
        _id: id,
        userId: userId
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const updatedResume = await db.collection('resumes').findOne({
      _id: id
    });

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error.message
    });
  }
};

// Delete a resume
const deleteResume = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    const result = await db.collection('resumes').deleteOne({
      _id: id,
      userId: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};

// Generate share token for resume
const generateResumeShareToken = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    // Use token utility from models
    const shareToken = makeShareToken();

    const result = await db.collection('resumes').updateOne(
      { 
        _id: id,
        userId: userId
      },
      { 
        $set: { 
          shareToken,
          isPublic: true,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Share token generated successfully',
      shareToken,
      shareUrl: `${process.env.FRONTEND_URL}/resume/shared/${shareToken}`
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share token',
      error: error.message
    });
  }
};

// Get shared resume by token
const getSharedResume = async (req, res) => {
  try {
    const db = getDB();
    const { token } = req.params;

    const resume = await db.collection('resumes').findOne({
      shareToken: token,
      isPublic: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Shared resume not found or no longer available'
      });
    }

    // Remove sensitive information
    const { userId, shareToken, ...publicResume } = resume;

    res.status(200).json({
      success: true,
      data: publicResume
    });
  } catch (error) {
    console.error('Error fetching shared resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared resume',
      error: error.message
    });
  }
};

// Export resume as PDF
const exportResumePDFLegacy = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    const resume = await db.collection('resumes').findOne({
      _id: id,
      userId: userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content based on template
    generatePDFContent(doc, resume);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF',
      error: error.message
    });
  }
};

// Helper function to generate PDF content
const generatePDFContent = (doc, resume) => {
  const { personalInfo, summary, education, experience, skills, projects, certifications } = resume;

  // Header with personal info
  doc.fontSize(24).font('Helvetica-Bold').text(personalInfo.fullName, { align: 'center' });
  doc.fontSize(12).font('Helvetica');
  
  if (personalInfo.email) doc.text(`Email: ${personalInfo.email}`, { align: 'center' });
  if (personalInfo.phone) doc.text(`Phone: ${personalInfo.phone}`, { align: 'center' });
  if (personalInfo.address) doc.text(`Address: ${personalInfo.address}`, { align: 'center' });
  
  doc.moveDown(2);

  // Summary
  if (summary) {
    doc.fontSize(16).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(summary);
    doc.moveDown(1.5);
  }

  // Experience
  if (experience && experience.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').text('WORK EXPERIENCE');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    experience.forEach(exp => {
      const title = exp.jobTitle || exp.position || '';
      const company = exp.company || '';
      const start = exp.startDate || '';
      const end = exp.isCurrentJob ? 'Present' : (exp.endDate || 'Present');

      doc.fontSize(12).font('Helvetica-Bold').text(title);
      doc.fontSize(11).font('Helvetica').text(`${company} | ${start} - ${end}`);
      if (exp.description) {
        doc.fontSize(10).text(exp.description);
      }
      doc.moveDown(1);
    });
  }

  // Education
  if (education && education.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').text('EDUCATION');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    education.forEach(edu => {
      doc.fontSize(12).font('Helvetica-Bold').text(edu.degree);
      doc.fontSize(11).font('Helvetica').text(`${edu.institution} | ${edu.startDate} - ${edu.endDate || 'Present'}`);
      if (edu.description) {
        doc.fontSize(10).text(edu.description);
      }
      doc.moveDown(1);
    });
  }

  // Skills
  if (skills && skills.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').text('SKILLS');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    const skillText = skills.map(skill => `${skill.name} (${skill.level})`).join(', ');
    doc.fontSize(11).font('Helvetica').text(skillText);
    doc.moveDown(1.5);
  }

  // Projects
  if (projects && projects.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').text('PROJECTS');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    projects.forEach(project => {
      doc.fontSize(12).font('Helvetica-Bold').text(project.name);
      if (project.description) {
        doc.fontSize(10).font('Helvetica').text(project.description);
      }
      if (project.technologies && project.technologies.length > 0) {
        doc.fontSize(9).text(`Technologies: ${project.technologies.join(', ')}`);
      }
      doc.moveDown(1);
    });
  }
};

// Build a DOCX document from resume data (simple, clean layout)
function buildDocxFromResume(resume, template = 'modern') {
  const d = resume || {};
  const p = d.personalInfo || {};

  const children = [];

  // Name and contact
  children.push(new Paragraph({ text: p.fullName || 'Resume', heading: HeadingLevel.TITLE }));
  const contactLine = [p.email, p.phone, p.location].filter(Boolean).join(' | ');
  if (contactLine) {
    children.push(new Paragraph({ children: [new TextRun({ text: contactLine })] }));
  }

  // Summary
  if (d.summary) {
    children.push(new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ children: [new TextRun(d.summary)] }));
  }

  // Experience
  if (Array.isArray(d.experience) && d.experience.length > 0) {
    children.push(new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_2 }));
    d.experience.forEach(exp => {
      const title = exp.jobTitle || exp.position || '';
      const company = exp.company || '';
      const start = exp.startDate || '';
      const end = exp.isCurrentJob ? 'Present' : (exp.endDate || 'Present');
      children.push(new Paragraph({ children: [new TextRun({ text: `${title}`, bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun(`${company} | ${start} - ${end}`)] }));
      if (exp.description) {
        children.push(new Paragraph({ children: [new TextRun(exp.description)] }));
      }
    });
  }

  // Education
  if (Array.isArray(d.education) && d.education.length > 0) {
    children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }));
    d.education.forEach(ed => {
      const degree = ed.degree || ed.title || '';
      const school = ed.school || ed.institution || '';
      const years = [ed.startDate, ed.endDate].filter(Boolean).join(' - ');
      children.push(new Paragraph({ children: [new TextRun({ text: `${degree}`, bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun(`${school}${years ? ' | ' + years : ''}`)] }));
      if (ed.description) {
        children.push(new Paragraph({ children: [new TextRun(ed.description)] }));
      }
    });
  }

  // Skills
  if (Array.isArray(d.skills) && d.skills.length > 0) {
    children.push(new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ children: [new TextRun(d.skills.map(s => s.name || s).join(', '))] }));
  }

  // Projects
  if (Array.isArray(d.projects) && d.projects.length > 0) {
    children.push(new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }));
    d.projects.forEach(pr => {
      children.push(new Paragraph({ children: [new TextRun({ text: pr.title || pr.name || '', bold: true })] }));
      if (pr.description) {
        children.push(new Paragraph({ children: [new TextRun(pr.description)] }));
      }
    });
  }

  return new Document({ sections: [{ properties: {}, children }] });
}

// Export resume PDF by ID (existing)
async function exportResumePDF(req, res) {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user?.userId;

    const resume = await db.collection('resumes').findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    generatePDFContent(doc, resume);
    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
}

// Export resume DOCX by ID
async function exportResumeDOCX(req, res) {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = req.user?.userId;

    const resume = await db.collection('resumes').findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const template = req.query.template || resume.template || 'modern';
    const doc = buildDocxFromResume(resume, template);
    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.docx`;

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('DOCX export error:', err);
    return res.status(500).json({ message: 'Failed to export DOCX' });
  }
}

// Export resume PDF using body data (no DB lookup)
async function exportResumePDFByBody(req, res) {
  try {
    const resume = req.body || {};
    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    generatePDFContent(doc, resume);
    doc.end();
  } catch (err) {
    console.error('PDF export by body error:', err);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
}

// Export resume DOCX using body data (no DB lookup)
async function exportResumeDOCXByBody(req, res) {
  try {
    const resume = req.body || {};
    const template = req.query.template || resume.template || 'modern';
    const doc = buildDocxFromResume(resume, template);
    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.docx`;

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('DOCX export by body error:', err);
    return res.status(500).json({ message: 'Failed to export DOCX' });
  }
}

// Public: Export shared resume PDF by share token
async function exportSharedResumePDF(req, res) {
  try {
    const db = getDB();
    const { token } = req.params;
    const resume = await db.collection('resumes').findOne({ shareToken: token, isPublic: true });
    if (!resume) {
      return res.status(404).json({ message: 'Shared resume not found or not public' });
    }

    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    generatePDFContent(doc, resume);
    doc.end();
  } catch (err) {
    console.error('Shared PDF export error:', err);
    return res.status(500).json({ message: 'Failed to export shared PDF' });
  }
}

// Public: Export shared resume DOCX by share token
async function exportSharedResumeDOCX(req, res) {
  try {
    const db = getDB();
    const { token } = req.params;
    const resume = await db.collection('resumes').findOne({ shareToken: token, isPublic: true });
    if (!resume) {
      return res.status(404).json({ message: 'Shared resume not found or not public' });
    }

    const template = req.query.template || resume.template || 'modern';
    const doc = buildDocxFromResume(resume, template);
    const filename = `${(resume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_Resume.docx`;

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('Shared DOCX export error:', err);
    return res.status(500).json({ message: 'Failed to export shared DOCX' });
  }
}

module.exports = {
  getUserResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  generateResumeShareToken,
  getSharedResume,
  exportResumePDF,
  exportResumeDOCX,
  exportResumePDFByBody,
  exportResumeDOCXByBody,
  exportSharedResumePDF,
  exportSharedResumeDOCX,
};