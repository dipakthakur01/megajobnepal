const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');
const { getDB } = require('../config/db');

class CVExportService {
  constructor() {
    this.exportDir = path.join(__dirname, '../exports');
    this.ensureExportDirectory();
  }

  ensureExportDirectory() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  // Generate PDF for a single candidate
  async generateCandidatePDF(candidateData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `candidate_${candidateData.candidateId}_${Date.now()}.pdf`;
        const filepath = path.join(this.exportDir, filename);
        
        doc.pipe(fs.createWriteStream(filepath));

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Candidate Profile', { align: 'center' });
        doc.moveDown();

        // Personal Information
        doc.fontSize(16).font('Helvetica-Bold').text('Personal Information');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Name: ${candidateData.candidateName}`);
        doc.text(`Email: ${candidateData.candidateEmail}`);
        doc.text(`Applied Date: ${new Date(candidateData.appliedAt).toLocaleDateString()}`);
        doc.text(`Status: ${candidateData.currentStatus}`);
        if (candidateData.expectedSalary) {
          doc.text(`Expected Salary: NPR ${candidateData.expectedSalary.toLocaleString()}`);
        }
        doc.text(`Availability: ${candidateData.availability || 'Not specified'}`);
        doc.moveDown();

        // AI Analysis Score
        if (candidateData.totalScore !== undefined) {
          doc.fontSize(16).font('Helvetica-Bold').text('AI Analysis Score');
          doc.fontSize(12).font('Helvetica');
          doc.text(`Overall Score: ${candidateData.totalScore}/100`);
          doc.text(`Recommendation: ${candidateData.recommendation}`);
          doc.moveDown();

          // Score Breakdown
          doc.fontSize(14).font('Helvetica-Bold').text('Score Breakdown:');
          doc.fontSize(10).font('Helvetica');
          candidateData.factors?.forEach(factor => {
            doc.text(`• ${factor.factor}: ${factor.score} points - ${factor.details}`);
          });
          doc.moveDown();
        }

        // Cover Letter
        if (candidateData.coverLetter) {
          doc.fontSize(16).font('Helvetica-Bold').text('Cover Letter');
          doc.fontSize(10).font('Helvetica');
          const coverLetterText = candidateData.coverLetter.substring(0, 1000);
          doc.text(coverLetterText + (candidateData.coverLetter.length > 1000 ? '...' : ''));
          doc.moveDown();
        }

        // Resume Link
        if (candidateData.resumeUrl) {
          doc.fontSize(16).font('Helvetica-Bold').text('Resume');
          doc.fontSize(10).font('Helvetica');
          doc.text(`Resume URL: ${candidateData.resumeUrl}`);
        }

        doc.end();

        doc.on('end', () => {
          resolve({
            filename,
            filepath,
            size: fs.statSync(filepath).size
          });
        });

        doc.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate Word document for a single candidate
  async generateCandidateWord(candidateData) {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Candidate Profile",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: "Personal Information",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Name: ", bold: true }),
                new TextRun(candidateData.candidateName),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Email: ", bold: true }),
                new TextRun(candidateData.candidateEmail),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Applied Date: ", bold: true }),
                new TextRun(new Date(candidateData.appliedAt).toLocaleDateString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Status: ", bold: true }),
                new TextRun(candidateData.currentStatus),
              ],
            }),
            ...(candidateData.expectedSalary ? [new Paragraph({
              children: [
                new TextRun({ text: "Expected Salary: ", bold: true }),
                new TextRun(`NPR ${candidateData.expectedSalary.toLocaleString()}`),
              ],
            })] : []),
            new Paragraph({
              children: [
                new TextRun({ text: "Availability: ", bold: true }),
                new TextRun(candidateData.availability || 'Not specified'),
              ],
            }),
            ...(candidateData.totalScore !== undefined ? [
              new Paragraph({
                text: "AI Analysis Score",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Overall Score: ", bold: true }),
                  new TextRun(`${candidateData.totalScore}/100`),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Recommendation: ", bold: true }),
                  new TextRun(candidateData.recommendation),
                ],
              }),
            ] : []),
            ...(candidateData.coverLetter ? [
              new Paragraph({
                text: "Cover Letter",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: candidateData.coverLetter.substring(0, 1000) + 
                      (candidateData.coverLetter.length > 1000 ? '...' : ''),
              }),
            ] : []),
            ...(candidateData.resumeUrl ? [
              new Paragraph({
                text: "Resume",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Resume URL: ", bold: true }),
                  new TextRun(candidateData.resumeUrl),
                ],
              }),
            ] : []),
          ],
        }],
      });

      const filename = `candidate_${candidateData.candidateId}_${Date.now()}.docx`;
      const filepath = path.join(this.exportDir, filename);
      
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filepath, buffer);

      return {
        filename,
        filepath,
        size: fs.statSync(filepath).size
      };

    } catch (error) {
      throw error;
    }
  }

  // Generate Excel file for multiple candidates
  async generateCandidatesExcel(candidatesData, jobTitle = 'Job Applications') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Candidates');

      // Define columns
      worksheet.columns = [
        { header: 'Candidate Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Applied Date', key: 'appliedDate', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'AI Score', key: 'aiScore', width: 10 },
        { header: 'Recommendation', key: 'recommendation', width: 18 },
        { header: 'Expected Salary', key: 'expectedSalary', width: 15 },
        { header: 'Availability', key: 'availability', width: 15 },
        { header: 'Skills Match', key: 'skillsMatch', width: 15 },
        { header: 'Experience Score', key: 'experienceScore', width: 15 },
        { header: 'Resume URL', key: 'resumeUrl', width: 30 },
        { header: 'Cover Letter Preview', key: 'coverLetterPreview', width: 40 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      candidatesData.forEach(candidate => {
        const skillsMatchFactor = candidate.factors?.find(f => f.factor === 'Skills Match');
        const experienceFactor = candidate.factors?.find(f => f.factor === 'Experience Level');
        
        worksheet.addRow({
          name: candidate.candidateName,
          email: candidate.candidateEmail,
          appliedDate: new Date(candidate.appliedAt).toLocaleDateString(),
          status: candidate.currentStatus,
          aiScore: candidate.totalScore || 'N/A',
          recommendation: candidate.recommendation || 'N/A',
          expectedSalary: candidate.expectedSalary ? `NPR ${candidate.expectedSalary.toLocaleString()}` : 'Not specified',
          availability: candidate.availability || 'Not specified',
          skillsMatch: skillsMatchFactor ? `${skillsMatchFactor.score} - ${skillsMatchFactor.details}` : 'N/A',
          experienceScore: experienceFactor ? `${experienceFactor.score} - ${experienceFactor.details}` : 'N/A',
          resumeUrl: candidate.resumeUrl || 'Not provided',
          coverLetterPreview: candidate.coverLetter ? 
            candidate.coverLetter.substring(0, 100) + (candidate.coverLetter.length > 100 ? '...' : '') : 
            'Not provided'
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width, 10);
      });

      // Add conditional formatting for AI scores
      worksheet.addConditionalFormatting({
        ref: `E2:E${candidatesData.length + 1}`,
        rules: [
          {
            type: 'cellIs',
            operator: 'greaterThanOrEqual',
            formulae: [80],
            style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF90EE90' } } }
          },
          {
            type: 'cellIs',
            operator: 'between',
            formulae: [65, 79],
            style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFFF00' } } }
          },
          {
            type: 'cellIs',
            operator: 'lessThan',
            formulae: [50],
            style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF6B6B' } } }
          }
        ]
      });

      const filename = `candidates_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
      const filepath = path.join(this.exportDir, filename);
      
      await workbook.xlsx.writeFile(filepath);

      return {
        filename,
        filepath,
        size: fs.statSync(filepath).size
      };

    } catch (error) {
      throw error;
    }
  }

  // Export single candidate in specified format
  async exportSingleCandidate(candidateId, applicationId, format = 'pdf') {
    try {
      const db = getDB();
      
      // Get application and candidate data
      const application = await db.collection('applications').findOne({ 
        _id: applicationId 
      });
      
      if (!application) {
        throw new Error('Application not found');
      }

      const candidate = await db.collection('users').findOne({ 
        _id: candidateId 
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      const candidateData = {
        candidateId: candidate._id,
        candidateName: candidate.full_name,
        candidateEmail: candidate.email,
        appliedAt: application.applied_at,
        currentStatus: application.status,
        resumeUrl: application.resume_url,
        coverLetter: application.cover_letter,
        expectedSalary: application.expected_salary,
        availability: application.availability
      };

      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.generateCandidatePDF(candidateData);
        case 'word':
        case 'docx':
          return await this.generateCandidateWord(candidateData);
        default:
          throw new Error('Unsupported format. Use pdf, word, or docx');
      }

    } catch (error) {
      throw error;
    }
  }

  // Export multiple candidates for a job
  async exportJobCandidates(jobId, format = 'excel', includeAIAnalysis = true) {
    try {
      const db = getDB();
      
      // Get job details
      const job = await db.collection('jobs').findOne({ _id: jobId });
      if (!job) {
        throw new Error('Job not found');
      }

      // Get applications for this job
      const applications = await db.collection('applications').find({ 
        job_id: jobId 
      }).toArray();

      if (applications.length === 0) {
        throw new Error('No applications found for this job');
      }

      // Get candidate details
      const candidateIds = applications.map(app => app.job_seeker_id);
      const candidates = await db.collection('users').find({
        _id: { $in: candidateIds }
      }).toArray();

      // Create candidate map
      const candidateMap = {};
      candidates.forEach(candidate => {
        candidateMap[candidate._id.toString()] = candidate;
      });

      // Prepare candidate data
      let candidatesData = applications.map(application => {
        const candidate = candidateMap[application.job_seeker_id];
        if (!candidate) return null;

        return {
          candidateId: candidate._id,
          candidateName: candidate.full_name,
          candidateEmail: candidate.email,
          appliedAt: application.applied_at,
          currentStatus: application.status,
          resumeUrl: application.resume_url,
          coverLetter: application.cover_letter,
          expectedSalary: application.expected_salary,
          availability: application.availability
        };
      }).filter(Boolean);

      // Add AI analysis if requested
      if (includeAIAnalysis) {
        const aiService = require('./aiCvAnalysisService');
        const analysis = await aiService.analyzeAndRankCandidates(jobId);
        
        // Merge AI analysis data
        candidatesData = analysis.rankedCandidates.map(rankedCandidate => {
          const baseData = candidatesData.find(c => 
            c.candidateId.toString() === rankedCandidate.candidateId.toString()
          );
          return { ...baseData, ...rankedCandidate };
        });
      }

      switch (format.toLowerCase()) {
        case 'excel':
        case 'xlsx':
          return await this.generateCandidatesExcel(candidatesData, job.title);
        default:
          throw new Error('Unsupported format for bulk export. Use excel or xlsx');
      }

    } catch (error) {
      throw error;
    }
  }

  // Clean up old export files
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(this.exportDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.exportDir, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up export files:', error);
    }
  }
}

module.exports = new CVExportService();