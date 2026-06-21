import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// --- Configs / Secrets ---
const JWT_SECRET = process.env.JWT_SECRET || "RITIKA_TECH_DEFAULT_JWT_SECRET_KEY";
const DB_FILE = path.join(process.cwd(), "db-store.json");

// --- MongoDB Schemas (Mongoose) ---
let isMongoConnected = false;

const MongoUser: any = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  classSelection: String,
  higherStudies: String,
  hashedAcc: String,
  studentInfo: {
    studentName: String,
    className: String,
    age: String,
    parentName: String,
    phoneNumber: String,
    userImg: String,
    resultPic: String
  }
}));

const MongoComplaint: any = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
  studentEmail: String,
  className: String,
  complaintText: String,
  postedBy: { type: String, default: "student" }, // 'student' | 'visitor' | 'admin'
  createdAt: { type: Date, default: Date.now }
}));

const MongoAnnouncement: any = mongoose.models.Announcement || mongoose.model("Announcement", new mongoose.Schema({
  title: String,
  content: String,
  type: { type: String, default: "announcement" },
  createdAt: { type: Date, default: Date.now }
}));

const MongoSettings: any = mongoose.models.Settings || mongoose.model("Settings", new mongoose.Schema({
  key: { type: String, default: "admin-settings" },
  nowStudying: { type: String, default: "Introduction to Algorithm Complexity & C++ Basics" },
  progressPercent: { type: Number, default: 20 }
}));

const MongoOtp: any = mongoose.models.Otp || mongoose.model("Otp", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  passwordHash: String,
  expiresAt: { type: Date, required: true }
}));

// --- In-Memory File Storage Fallback Schema ---
interface DBState {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    classSelection?: string;
    higherStudies?: string;
    hashedAcc?: string;
    studentInfo?: {
      studentName: string;
      className: string;
      age: string;
      parentName: string;
      phoneNumber: string;
      userImg?: string;
      resultPic: string;
    };
  }>;
  complaints: Array<{
    id: string;
    studentEmail: string;
    className: string;
    complaintText: string;
    postedBy: "student" | "visitor" | "admin";
    createdAt: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    type: "homework" | "announcement" | "change";
    createdAt: string;
  }>;
  adminSettings: {
    nowStudying: string;
    progressPercent: number;
  };
  adminSettingsMap?: Record<string, { nowStudying: string; progressPercent: number }>;
  otps: Record<string, { otp: string; expiresAt: number; passwordHash: string }>;
}

const defaultState: DBState = {
  users: [],
  complaints: [],
  announcements: [
    {
      id: "ann-1",
      title: "Welcome to Ritika's Tech Hub!",
      content: "Feel free to explore our courses in C++, Java, and Python.",
      type: "announcement",
      createdAt: new Date().toISOString(),
    },
  ],
  adminSettings: {
    nowStudying: "Introduction to Algorithm Complexity & C++ Basics",
    progressPercent: 20,
  },
  adminSettingsMap: {},
  otps: {},
};

function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading database file, using fallback state", e);
  }
  return defaultState;
}

function saveDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing to database file", e);
  }
}

// Quick hash function for custom /student/class/hashedAcc route
function getSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// --- Dynamic Storage Abstraction Functions ---

async function findUserByEmail(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  if (isMongoConnected) {
    return await MongoUser.findOne({ email: cleanEmail }).lean();
  } else {
    const db = loadDB();
    return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }
}

async function findUserById(id: string) {
  if (isMongoConnected) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await MongoUser.findById(id).lean();
    }
    return await MongoUser.findOne({ $or: [{ _id: id as any }, { id }] }).lean();
  } else {
    const db = loadDB();
    return db.users.find((u) => u.id === id) || null;
  }
}

async function createUser(userObj: any) {
  if (isMongoConnected) {
    const newUser = new MongoUser({
      email: userObj.email.toLowerCase(),
      passwordHash: userObj.passwordHash,
      hashedAcc: userObj.hashedAcc || getSimpleHash(userObj.email.toLowerCase()),
      classSelection: userObj.classSelection,
      higherStudies: userObj.higherStudies,
      studentInfo: userObj.studentInfo
    });
    const saved = await newUser.save();
    return JSON.parse(JSON.stringify(saved));
  } else {
    const db = loadDB();
    userObj.id = "usr-" + Date.now().toString(36);
    userObj.hashedAcc = getSimpleHash(userObj.email.toLowerCase());
    db.users.push(userObj);
    saveDB(db);
    return userObj;
  }
}

async function updateUser(id: string, updateData: any) {
  if (isMongoConnected) {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const saved = await MongoUser.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
    return JSON.parse(JSON.stringify(saved));
  } else {
    const db = loadDB();
    const user = db.users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updateData);
      saveDB(db);
    }
    return user;
  }
}

async function listStudents() {
  if (isMongoConnected) {
    const students = await MongoUser.find({}).lean();
    return JSON.parse(JSON.stringify(students)).map((s: any) => ({
      ...s,
      id: s._id ? s._id.toString() : s.id
    }));
  } else {
    const db = loadDB();
    return db.users;
  }
}

async function createComplaint(complaintObj: any) {
  if (isMongoConnected) {
    const comp = new MongoComplaint({
      studentEmail: complaintObj.studentEmail.toLowerCase(),
      className: complaintObj.className || "N/A",
      complaintText: complaintObj.complaintText,
      postedBy: complaintObj.postedBy || "student",
      createdAt: new Date()
    });
    const saved = await comp.save();
    return JSON.parse(JSON.stringify(saved));
  } else {
    const db = loadDB();
    const cObj = {
      id: "comp-" + Date.now().toString(36),
      studentEmail: complaintObj.studentEmail.toLowerCase(),
      className: complaintObj.className || "N/A",
      complaintText: complaintObj.complaintText,
      postedBy: complaintObj.postedBy || "student",
      createdAt: new Date().toISOString()
    };
    db.complaints.push(cObj);
    saveDB(db);
    return cObj;
  }
}

async function listComplaints() {
  if (isMongoConnected) {
    const complaints = await MongoComplaint.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(complaints));
  } else {
    const db = loadDB();
    return [...db.complaints].reverse();
  }
}

async function createAnnouncement(annObj: any) {
  if (isMongoConnected) {
    const ann = new MongoAnnouncement({
      title: annObj.title,
      content: annObj.content,
      type: annObj.type || "announcement",
      createdAt: new Date()
    });
    const saved = await ann.save();
    return JSON.parse(JSON.stringify(saved));
  } else {
    const db = loadDB();
    const aObj = {
      id: "ann-" + Date.now().toString(36),
      title: annObj.title,
      content: annObj.content,
      type: annObj.type || "announcement",
      createdAt: new Date().toISOString()
    };
    db.announcements.unshift(aObj);
    saveDB(db);
    return aObj;
  }
}

async function listAnnouncements() {
  if (isMongoConnected) {
    const announcements = await MongoAnnouncement.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(announcements));
  } else {
    const db = loadDB();
    return db.announcements;
  }
}

async function getAdminSettings(targetClass = "All", targetBatch = "All") {
  const customKey = `admin-settings-${targetClass}-${targetBatch}`;
  if (isMongoConnected) {
    let settings = await MongoSettings.findOne({ key: customKey }).lean();
    if (!settings) {
      const defaultSettings = await MongoSettings.findOne({ key: "admin-settings" }).lean();
      settings = {
        key: customKey,
        nowStudying: defaultSettings?.nowStudying || "Introduction to Algorithm Complexity & C++ Basics",
        progressPercent: defaultSettings?.progressPercent || 20
      };
      await MongoSettings.create(settings);
    }
    return JSON.parse(JSON.stringify(settings));
  } else {
    const db = loadDB();
    if (!db.adminSettingsMap) {
      db.adminSettingsMap = {};
    }
    if (!db.adminSettingsMap[customKey]) {
      db.adminSettingsMap[customKey] = {
        nowStudying: db.adminSettings?.nowStudying || "Introduction to Algorithm Complexity & C++ Basics",
        progressPercent: db.adminSettings?.progressPercent || 20
      };
      saveDB(db);
    }
    return db.adminSettingsMap[customKey];
  }
}

async function updateAdminSettings(settingsObj: any, targetClass = "All", targetBatch = "All") {
  const customKey = `admin-settings-${targetClass}-${targetBatch}`;
  if (isMongoConnected) {
    const updated = await MongoSettings.findOneAndUpdate(
      { key: customKey },
      { $set: { ...settingsObj, key: customKey } },
      { new: true, upsert: true }
    ).lean();
    if (targetClass === "All" && targetBatch === "All") {
      await MongoSettings.findOneAndUpdate(
        { key: "admin-settings" },
        { $set: settingsObj },
        { upsert: true }
      );
    }
    return JSON.parse(JSON.stringify(updated));
  } else {
    const db = loadDB();
    if (!db.adminSettingsMap) {
      db.adminSettingsMap = {};
    }
    db.adminSettingsMap[customKey] = {
      nowStudying: settingsObj.nowStudying !== undefined ? settingsObj.nowStudying : db.adminSettings.nowStudying,
      progressPercent: settingsObj.progressPercent !== undefined ? Number(settingsObj.progressPercent) : db.adminSettings.progressPercent
    };
    if (targetClass === "All" && targetBatch === "All") {
      db.adminSettings = { ...db.adminSettings, ...settingsObj };
    }
    saveDB(db);
    return db.adminSettingsMap[customKey];
  }
}

async function saveOtpRecord(email: string, otp: string, passwordHash: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  if (isMongoConnected) {
    await MongoOtp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, passwordHash, expiresAt },
      { upsert: true, new: true }
    );
  } else {
    const db = loadDB();
    db.otps[email.toLowerCase()] = {
      otp,
      expiresAt: expiresAt.getTime(),
      passwordHash
    };
    saveDB(db);
  }
}

async function findOtpRecord(email: string) {
  if (isMongoConnected) {
    const r = await MongoOtp.findOne({ email: email.toLowerCase() }).lean();
    if (r && new Date(r.expiresAt).getTime() > Date.now()) {
      return {
        otp: r.otp,
        passwordHash: r.passwordHash
      };
    }
    return null;
  } else {
    const db = loadDB();
    const r = db.otps[email.toLowerCase()];
    if (r && r.expiresAt > Date.now()) {
      return r;
    }
    return null;
  }
}

async function deleteOtpRecord(email: string) {
  if (isMongoConnected) {
    await MongoOtp.deleteOne({ email: email.toLowerCase() });
  } else {
    const db = loadDB();
    delete db.otps[email.toLowerCase()];
    saveDB(db);
  }
}

// Clean older expired OTPs periodically (Only if local)
setInterval(async () => {
  if (!isMongoConnected) {
    const db = loadDB();
    const now = Date.now();
    let updated = false;
    for (const email in db.otps) {
      if (db.otps[email].expiresAt < now) {
        delete db.otps[email];
        updated = true;
      }
    }
    if (updated) saveDB(db);
  } else {
    try {
      await MongoOtp.deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (e) {
      // safe ignore silences
    }
  }
}, 60 * 1000);

// --- Mailer Handler (Actual serverless Gmail.com) ---
async function sendActualGmailOTP(email: string, otp: string) {
  const gUser = process.env.GMAIL_USER;
  const gPass = process.env.GMAIL_PASS;

  if (gUser && gPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gUser,
          pass: gPass
        }
      });

      const mailOptions = {
        from: `"Ritika's Tech Hub" <${gUser}>`,
        to: email,
        subject: "Enrollment Security OTP Verification - Ritika's Tech Hub",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #06b6d4; margin: 0; font-size: 26px;">Ritika's Tech Hub</h1>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin: 5px 0 0 0;">Learn Every Code</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
            <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">Welcome to the Tech Hub! You successfully initiated an enrollment record. Please verify your registration session using the security PIN (OTP) code generated below:</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #0f172a; margin: 25px 0; font-family: monospace;">
              ${otp}
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #475569;">Note: This code was dispatched using actual serverless <strong>gmail.com</strong> routing. This OTP will expire in <strong>10 minutes</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 30px; margin-bottom: 20px;" />
            <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0;">© 2026 Ritika's Tech Hub. Sandbox and Cloud Run compatible.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SYS-GMAIL-EMAILER] Gmail OTP dispatched to ${email}`);
      return { success: true, method: "gmail" };
    } catch (e) {
      console.error("[SYS-GMAIL-EMAILER] Failed to dispatch real Gmail OTP. Falling back gracefully. Error:", e);
    }
  }

  console.log(`[SYS-MOCK-EMAILER] Mocking OTP transfer to ${email}. Token Pin code: ${otp}`);
  return { success: true, method: "fallback" };
}

// --- API Endpoints ---

// 1. Register: generate secure salt, hash password with Bcrypt and send OTP
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: "An account already exists with this email address." });
    }

    // Bcrypt Password hashing
    const saltRounds = 10;
    const cryptHash = await bcrypt.hash(password, saltRounds);

    // Generate 6 digit security code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache to collection / record
    await saveOtpRecord(email, otp, cryptHash);

    // Dispatch Gmail.com OTP
    await sendActualGmailOTP(email, otp);

    return res.json({
      success: true,
      message: "OTP Verification Code dispatched! (Simulated or Real via Gmail)",
      otp, // return OTP code directly so user can interact and test with zero configuration or keys
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Could not register user" });
  }
});

// 2. Verify OTP and complete registration with MongoDB/Store insertion
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and OTP are required" });
  }

  try {
    const record = await findOtpRecord(email);
    if (!record) {
      return res.status(400).json({ success: false, error: "Verification code has expired or was not generated." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, error: "Incorrect security OTP code, check again." });
    }

    // Save actual user structure
    const hashedAccStr = getSimpleHash(email.toLowerCase().trim());
    const userPayload = {
      email: email.toLowerCase().trim(),
      passwordHash: record.passwordHash,
      hashedAcc: hashedAccStr
    };

    const savedUser = await createUser(userPayload);
    await deleteOtpRecord(email);

    // Generate official signed JWT Token
    const dbId = savedUser._id ? savedUser._id.toString() : savedUser.id;
    const jwtToken = jwt.sign(
      { id: dbId, email: savedUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Congratulations! Account verified successfully.",
      token: jwtToken,
      user: {
        email: savedUser.email,
        id: dbId,
        hashedAcc: hashedAccStr,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to finalize registration" });
  }
});

// 3. Secure Login flow
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  // Handle special Admin login
  if (email.toLowerCase() === "ritika@admin.tech") {
    if (password === "admin123") {
      const adminToken = jwt.sign(
        { id: "admin", email: "ritika@admin.tech" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        message: "Admin Access Approved!",
        token: adminToken,
        isAdmin: true,
        user: { email: "ritika@admin.tech", id: "admin" },
      });
    } else {
      return res.status(401).json({ success: false, error: "Incorrect admin entry password." });
    }
  }

  if (!password) {
    // Check if session retrieval check is running on start (used inside loadMe)
    return res.status(400).json({ success: false, error: "Password is required for login authentication." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not registered. Please sign up first."
      });
    }

    // Bcrypt match
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Incorrect user security password." });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign(
      { id: userId, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        email: user.email,
        id: userId,
        classSelection: user.classSelection,
        higherStudies: user.higherStudies,
        hashedAcc: user.hashedAcc,
        studentInfo: user.studentInfo
      }
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Login procedure disrupted" });
  }
});

// 3b. Session Checker Endpoint
app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, error: "Access token missing." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    if (verified.email === "ritika@admin.tech") {
      return res.json({
        success: true,
        isAdmin: true,
        user: { email: "ritika@admin.tech", id: "admin" }
      });
    }

    const user = await findUserById(verified.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "Profile not found." });
    }

    return res.json({
      success: true,
      isAdmin: false,
      user: {
        email: user.email,
        id: user._id ? user._id.toString() : user.id,
        classSelection: user.classSelection,
        higherStudies: user.higherStudies,
        hashedAcc: user.hashedAcc,
        studentInfo: user.studentInfo
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Session invalid." });
  }
});

// 4. Update Questionnaire (/auth/qs)
app.post("/api/student/submit-qs", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access token missing. Please sign in." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await findUserById(verified.id);

    if (!user) {
      return res.status(404).json({ error: "Student user document missing." });
    }

    const { classSelection, higherStudies } = req.body;
    const idToUpdate = user._id ? user._id.toString() : user.id;
    
    await updateUser(idToUpdate, {
      classSelection,
      higherStudies
    });

    const updated = await findUserById(idToUpdate);

    return res.json({
      success: true,
      message: "Cohort path customized successfully!",
      redirectUrl: `/student/${(classSelection || "unknown").toLowerCase()}/${updated ? updated.hashedAcc : ''}`
    });

  } catch (err) {
    return res.status(401).json({ error: "Authorization session expired. Re-authenticate." });
  }
});

// 5. Update complete Student Extra Info Form (StudentInfo tab)
app.post("/api/student/submit-info", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access token missing." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await findUserById(verified.id);
    if (!user) {
      return res.status(404).json({ error: "User profile record missing." });
    }

    const { studentName, className, age, parentName, phoneNumber, userImg, resultPic } = req.body;

    const updatedStudentInfo = {
      studentName,
      className,
      age,
      parentName,
      phoneNumber,
      userImg: userImg || "", // Optional user image, not starred
      resultPic: resultPic || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=300&fit=crop" // Upload result pic
    };

    const idToUpdate = user._id ? user._id.toString() : user.id;
    await updateUser(idToUpdate, { studentInfo: updatedStudentInfo });

    return res.json({
      success: true,
      message: "Student profile saved to database successfully!",
      studentInfo: updatedStudentInfo
    });

  } catch (e) {
    return res.status(401).json({ error: "Authentication failed." });
  }
});

// 6. General anonymous student or visitor complaint
app.post("/api/student/complaint", async (req, res) => {
  const { studentEmail, className, complaintText } = req.body;
  if (!studentEmail || !complaintText) {
    return res.status(400).json({ error: "Email and complaint details are required." });
  }

  try {
    await createComplaint({
      studentEmail: studentEmail.toLowerCase().trim(),
      className: className || "N/A",
      complaintText,
      postedBy: "student"
    });

    return res.json({
      success: true,
      message: "Your note has been securely submitted to Ritika's Admin Dashboard.",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit note." });
  }
});

// 7. Get studies stats & announcements
app.get("/api/student/dashboard-status", async (req, res) => {
  try {
    const targetClass = String(req.query.class || "All");
    const targetBatch = String(req.query.batch || "All");
    const settings = await getAdminSettings(targetClass, targetBatch);
    const ann = await listAnnouncements();
    return res.json({
      nowStudying: settings.nowStudying,
      progressPercent: settings.progressPercent,
      announcements: ann,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to retrieve live logs." });
  }
});

// 8. Admin posts a warning or complaint about a student meant for the parent (New Requirement)
app.post("/api/admin/complaint", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    if (verified.email !== "ritika@admin.tech") {
      return res.status(403).json({ error: "Forbidden. Admin access required." });
    }

    const { studentEmail, className, complaintText } = req.body;
    if (!studentEmail || !complaintText) {
      return res.status(400).json({ error: "Student email and complaint parameters are mandatory" });
    }

    const saved = await createComplaint({
      studentEmail: studentEmail.toLowerCase().trim(),
      className: className || "N/A",
      complaintText,
      postedBy: "admin"
    });

    return res.json({
      success: true,
      message: "Academic parent alert posted successfully!",
      complaint: saved
    });

  } catch (error) {
    return res.status(401).json({ error: "Invalid admin session token." });
  }
});

// 9. Fetch personal reports / academic warnings from Admin for parents (New Requirement)
app.get("/api/student/my-reports", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access path." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const allComplaints = await listComplaints();

    // Filter complaints specifically directed about this student's email, written by admin for parents
    const parentAlerts = allComplaints.filter((c: any) => 
      c.studentEmail?.toLowerCase() === verified.email.toLowerCase() && 
      c.postedBy === "admin"
    );

    return res.json({
      success: true,
      complaints: parentAlerts
    });
  } catch (err) {
    return res.status(401).json({ error: "Error reading parent alert updates." });
  }
});

// 10. Admin view full dashboard details
app.get("/api/admin/dashboard", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    if (verified.email !== "ritika@admin.tech") {
      return res.status(403).json({ error: "Forbidden." });
    }

    const students = await listStudents();
    const complaints = await listComplaints();
    const announcements = await listAnnouncements();
    const settings = await getAdminSettings();

    // Sort students alphabetically
    const sorted = [...students].sort((a: any, b: any) => {
      const nameA = a.studentInfo?.studentName?.toLowerCase() || a.email.toLowerCase();
      const nameB = b.studentInfo?.studentName?.toLowerCase() || b.email.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return res.json({
      success: true,
      students: sorted,
      complaints,
      announcements,
      adminSettings: settings,
    });

  } catch (error) {
    return res.status(401).json({ error: "Session invalid." });
  }
});

// 11. Admin updates studies status
app.post("/api/admin/update-status", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    if (verified.email !== "ritika@admin.tech") {
      return res.status(403).json({ error: "Forbidden." });
    }

    const { nowStudying, progressPercent, targetClass, targetBatch } = req.body;
    const settingsObj: any = {};
    if (nowStudying !== undefined) settingsObj.nowStudying = nowStudying;
    if (progressPercent !== undefined) settingsObj.progressPercent = Number(progressPercent);

    const updated = await updateAdminSettings(settingsObj, targetClass || "All", targetBatch || "All");

    return res.json({
      success: true,
      message: "Student live metric system updated!",
      adminSettings: updated
    });

  } catch (error) {
    return res.status(401).json({ error: "Session invalid." });
  }
});

// 12. Admin posts dynamic updates
app.post("/api/admin/add-announcement", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    if (verified.email !== "ritika@admin.tech") {
      return res.status(403).json({ error: "Forbidden." });
    }

    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content block are mandatory." });
    }

    await createAnnouncement({ title, content, type });
    const allAnn = await listAnnouncements();

    return res.json({
      success: true,
      message: "Alert publication active!",
      announcements: allAnn
    });

  } catch (error) {
    return res.status(401).json({ error: "Session invalidated." });
  }
});

// --- Boot Server & Establish Connections gracefully ---
let mongoosePromise: Promise<typeof mongoose> | null = null;

export async function ensureMongoDbConnected() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return false;
  }

  if (mongoose.connection.readyState >= 1) {
    isMongoConnected = true;
    return true;
  }

  if (!mongoosePromise) {
    mongoose.set("strictQuery", false);
    mongoosePromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    }).then(async (m) => {
      isMongoConnected = true;
      console.log(">>> MongoDB Atlas connected successfully (on-demand)!");

      try {
        const db = loadDB();

        // Seed initial admin configurations in atlas if needed
        const settingsCount = await MongoSettings.countDocuments();
        if (settingsCount === 0) {
          await MongoSettings.create({
            key: "admin-settings",
            nowStudying: "Introduction to Algorithm Complexity & C++ Basics",
            progressPercent: 20
          });
        }

        // Migrate admin settings map
        if (db && db.adminSettingsMap) {
          for (const key of Object.keys(db.adminSettingsMap)) {
            const val = db.adminSettingsMap[key];
            const exists = await MongoSettings.findOne({ key });
            if (!exists) {
              await MongoSettings.create({
                key,
                nowStudying: val.nowStudying,
                progressPercent: val.progressPercent
              });
            }
          }
        }

        // Proactive migration of users from local backup to MongoDB Atlas
        const usersCount = await MongoUser.countDocuments();
        if (usersCount === 0 && db && db.users && db.users.length > 0) {
          console.log(`>>> Migrating ${db.users.length} users from db-store.json to MongoDB Atlas...`);
          for (const u of db.users) {
            await MongoUser.create({
              email: u.email.toLowerCase(),
              passwordHash: u.passwordHash,
              classSelection: u.classSelection || "VIII",
              higherStudies: u.higherStudies || "B.TECH",
              hashedAcc: u.hashedAcc,
              studentInfo: u.studentInfo
            });
          }
        }

        // Migrate complaints
        const complaintsCount = await MongoComplaint.countDocuments();
        if (complaintsCount === 0 && db && db.complaints && db.complaints.length > 0) {
          console.log(`>>> Migrating ${db.complaints.length} complaints to MongoDB Atlas...`);
          for (const c of db.complaints) {
            await MongoComplaint.create({
              studentEmail: c.studentEmail,
              className: c.className,
              complaintText: c.complaintText,
              postedBy: c.postedBy || "student",
              createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
            });
          }
        }

        // Seed fallback or migrate announcements
        const annCount = await MongoAnnouncement.countDocuments();
        if (annCount === 0) {
          if (db && db.announcements && db.announcements.length > 0) {
            console.log(`>>> Migrating ${db.announcements.length} announcements to MongoDB Atlas...`);
            for (const a of db.announcements) {
              await MongoAnnouncement.create({
                title: a.title,
                content: a.content,
                type: a.type || "announcement",
                createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
              });
            }
          } else {
            await MongoAnnouncement.create({
              title: "Welcome to Ritika's Tech Hub!",
              content: "Feel free to explore our courses in C++, Java, and Python.",
              type: "announcement"
            });
          }
        }
      } catch (seedErr) {
        console.warn(">>> MongoDB Seeding completed with warnings:", seedErr);
      }
      return m;
    }).catch((err) => {
      console.error(">>> Error connecting to MongoDB Atlas! Falling back to file-based cache to remain stable. Error:", err);
      isMongoConnected = false;
      mongoosePromise = null;
      throw err;
    });
  }

  await mongoosePromise;
  return true;
}

// Global Express middleware to ensure database connection on incoming API requests in serverless scope
app.use(async (req, res, next) => {
  try {
    await ensureMongoDbConnected();
  } catch (err) {
    console.warn(">>> Database connection auto-check warning:", err.message || err);
  }
  next();
});

async function startServer() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      await ensureMongoDbConnected();
    } catch (e) {
      // Ignored: already reported
    }
  } else {
    console.log(">>> MONGODB_URI environment variable is unspecified. Using locally backed up cache: db-store.json.");
  }

  // Vite integration 
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NETLIFY !== "true") {
  startServer();
}
