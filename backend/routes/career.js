const express = require("express");
const Career = require("../models/career");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();


// Configure Multer for memory storage
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ===============================
// POST Apply for Job (public)
// ===============================
router.post("/apply", upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, coverLetter, jobTitle, jobId } = req.body;
    const resumeFile = req.file;

    console.log("Received Application Request:", { name, email, phone, jobTitle, hasResume: !!resumeFile });

    if (!name || !email || !phone || !jobTitle) {
      console.log("Missing fields in application request");
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    if (!resumeFile) {
      return res.status(400).json({ message: "Please upload your resume" });
    }

    // Email to Admin//  <p><strong>Job Title:</strong> ${jobTitle} (ID: ${jobId || 'N/A'})</p>
    const adminHtml = `
            <h3>New Job Application</h3>
              
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Applicant Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Cover Letter / Details:</strong></p>
            <p>${coverLetter || 'N/A'}</p>
        `;

    try {
      // 1. Send Notification to Admin
      await sendEmail({
        to: [process.env.EMAIL_USER, "zubairaltaf223@gmail.com"],
        subject: `New Application for ${jobTitle} - ${name}`,
        html: adminHtml,
        attachments: [
          {
            filename: resumeFile.originalname,
            content: resumeFile.buffer
          }
        ]
      });

      // 2. Send Confirmation to Applicant
      const applicantHtml = `
            <h3>Application Received</h3>
            <p>Dear ${name},</p>
            <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at Shield Support.</p>
            <p>We have successfully received your application details:</p>
            <ul>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Email:</strong> ${email}</li>
            </ul>
            <p>Our team will review your application and get back to you if your profile matches our requirements.</p>
            <p>Best regards,<br>Shield Support HR Team</p>
      `;

      await sendEmail({
        to: email,
        subject: `Application Received: ${jobTitle}`,
        html: applicantHtml
      });

      res.status(200).json({ message: "Application submitted successfully" });
    } catch (emailErr) {
      console.error("Failed to send application email:", emailErr);
      // Still return success to frontend if at least the attempt was made, 
      // or we can treat email failure as critical. 
      // Usually, if admin email fails, we might want to alert. 
      // For now, keeping consistent error response.
      res.status(500).json({ message: "Failed to send application email" });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ===============================
// GET all jobs (public)
// ===============================
router.get("/", async (req, res) => {
  try {
    // Check if this is an admin request (has Authorization header)
    const isAdminRequest = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');

    let query = {};
    if (!isAdminRequest) {
      // Public request - only show active jobs
      query.isActive = true;
    }
    // Admin request - show all jobs

    const jobs = await Career.find(query)
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});


// ===============================
// GET single job (public)
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);

    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job" });
  }
});


// ===============================
// CREATE job (admin)
// ===============================
router.post("/", auth, admin, async (req, res) => {
  try {
    const job = await Career.create(req.body);
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create job" });
  }
});


// ===============================
// UPDATE job (admin)
// ===============================
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const updated = await Career.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job" });
  }
});


// ===============================
// DELETE job (admin)
// ===============================
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deleted = await Career.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;
