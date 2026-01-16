const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true
    },

    jobCode: {
        type: String
    },

    shortDescription: {
        type: String,
        required: true
    },

    fullDescription: {
        type: String,
        required: true
    },

    department: {
        type: String
    },

    industry: {
        type: String
    },

    workModel: {
        type: String,
        enum: ["Remote", "Onsite", "Hybrid"],
        default: "Onsite"
    },

    employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship"],
        default: "Full-time"
    },

    experienceLevel: {
        type: String,
        enum: ["Entry", "Mid", "Senior", "Lead"]
    },

    location: {
        country: String,
        state: String,
        city: String,
        zipCode: String
    },

    salaryRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: "USD"
        }
    },

    skillsRequired: [String],

    responsibilities: [String],

    qualifications: [String],

    applyEmail: {
        type: String
    },

    applyLink: {
        type: String
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

// Pre-save hook to auto-generate jobCode if not provided
// Pre-save hook to auto-generate jobCode if not provided
CareerSchema.pre('save', async function () {
    if (!this.jobCode) {
        // Generate a random 6-digit code or use timestamp
        // Format: JOB-TimestampSuffix-Random
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(1000 + Math.random() * 9000);
        this.jobCode = `JOB-${timestamp}${random}`;
    }
});

module.exports = mongoose.model("Career", CareerSchema);
