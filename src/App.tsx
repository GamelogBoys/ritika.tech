import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Header 
} from "./components/Header";
import { 
  BackgroundPattern 
} from "./components/BackgroundPattern";
import { 
  User, 
  StudentProfile, 
  Complaint, 
  Announcement, 
  AdminSettings, 
  AppView 
} from "./types";
import { 
  GraduationCap, 
  TrendingUp, 
  Volume2, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Plus, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Users, 
  Inbox, 
  Sparkles, 
  Code,
  ShieldAlert,
  ClipboardList,
  Flame,
  BadgeAlert,
  FileWarning
} from "lucide-react";

// Pre-defined student avatars (Result Pics) for beautiful profile personalization
const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop",
];

export default function App() {
  // --- States ---
  const [view, setView] = useState<AppView>("landing");
  const [token, setToken] = useState<string | null>(localStorage.getItem("JWT-TOKEN"));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Modals / Supplementary view tabs on Student Screen
  const [showAbout, setShowAbout] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const [studentActiveTab, setStudentActiveTab] = useState<"dashboard" | "info" | "reachus">("dashboard");

  // API dynamic states
  const [nowStudying, setNowStudying] = useState("Introduction to Algorithm Complexity & C++ Basics");
  const [progressPercent, setProgressPercent] = useState(20);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Registration and Authentication Form states
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [receivedOtpFromServer, setReceivedOtpFromServer] = useState(""); // Helper for sandbox playability
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Questionnaire form states
  const [qsClass, setQsClass] = useState("VIII");
  const [qsHigherStudies, setQsHigherStudies] = useState("B.TECH");
  const [qsError, setQsError] = useState("");

  // StudentInfo form states (Image 4 form fields)
  const [infoName, setInfoName] = useState("");
  const [infoClass, setInfoClass] = useState("VIII");
  const [infoAge, setInfoAge] = useState("");
  const [infoParent, setInfoParent] = useState("");
  const [infoPhone, setInfoPhone] = useState("");
  const [infoUserImg, setInfoUserImg] = useState(""); // Optional profile upload, NOT starred (*)
  const [infoResultPic, setInfoResultPic] = useState(""); // Mandatory uploaded result pic (*), starred (*)
  const [infoSuccess, setInfoSuccess] = useState("");
  
  // Back-end parent alert notices
  const [parentAlerts, setParentAlerts] = useState<Complaint[]>([]);

  // Admin-posed complaints targeting student for parents
  const [adminCompStudentEmail, setAdminCompStudentEmail] = useState("");
  const [adminCompText, setAdminCompText] = useState("");
  const [adminCompClass, setAdminCompClass] = useState("VIII");
  const [adminCompSuccess, setAdminCompSuccess] = useState("");
  
  // Corner pop-up toggle state (image 4 directive)
  const [dismissedInfoPopup, setDismissedInfoPopup] = useState(false);

  // Guest complaint states (from image 5: s.name, class, complaint)
  const [guestEmail, setGuestEmail] = useState("");
  const [guestClass, setGuestClass] = useState("VIII");
  const [guestComplaint, setGuestComplaint] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState("");

  // Search state in landing page
  const [searchCodeQuery, setSearchCodeQuery] = useState("");
  const [searchedSyntaxResult, setSearchedSyntaxResult] = useState<string | null>(null);

  // Admin states (Only viewable by ritika@admin.tech)
  const [adminStudents, setAdminStudents] = useState<User[]>([]);
  const [adminComplaints, setAdminComplaints] = useState<Complaint[]>([]);
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
  
  // Admin input controls
  const [adminNowStudying, setAdminNowStudying] = useState("");
  const [adminProgressPercent, setAdminProgressPercent] = useState(20);
  const [adminAnnTitle, setAdminAnnTitle] = useState("");
  const [adminAnnContent, setAdminAnnContent] = useState("");
  const [adminAnnType, setAdminAnnType] = useState<"homework" | "announcement" | "change">("announcement");
  const [adminFilterClass, setAdminFilterClass] = useState<string>("All");
  const [adminFilterBatch, setAdminFilterBatch] = useState<string>("All");
  const [adminFilterTiming, setAdminFilterTiming] = useState<string>("All");
  const [trackTargetClass, setTrackTargetClass] = useState<string>("VIII");
  const [trackTargetBatch, setTrackTargetBatch] = useState<string>("B.TECH");

  // Load basic session / status
  const loadMe = async (currentToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${currentToken}` }
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Session verification failed");
      }

      if (data.isAdmin) {
        setCurrentUser({ id: "admin", email: "ritika@admin.tech" });
        setView("admin");
        fetchAdminDashboard(currentToken);
        return;
      }

      const userObj = data.user;
      setCurrentUser(userObj);
      
      // Auto routing based on questionnaire status
      if (userObj.classSelection) {
        setView("student");
        // Pre-populate input fields
        if (userObj.studentInfo) {
          setInfoName(userObj.studentInfo.studentName || "");
          setInfoClass(userObj.studentInfo.className || "VIII");
          setInfoAge(userObj.studentInfo.age || "");
          setInfoParent(userObj.studentInfo.parentName || "");
          setInfoPhone(userObj.studentInfo.phoneNumber || "");
          setInfoUserImg(userObj.studentInfo.userImg || "");
          setInfoResultPic(userObj.studentInfo.resultPic || "");
        }
        fetchParentAlerts(currentToken);
        fetchStudentStatus(userObj);
      } else {
        setView("qs");
      }
    } catch (e) {
      console.warn("Session expired or invalid, cleaning up state", e);
      handleLogout();
    }
  };

  // Helper hash
  function getSimpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  // Initial loads
  useEffect(() => {
    fetchStudentStatus();
    if (token) {
      loadMe(token);
    }
    
    // Hash routing synchronization
    const handleHash = () => {
      const h = window.location.hash;
      if (h === "#/auth") {
        setView("auth");
      } else if (h.startsWith("#/student")) {
        if (token) {
          setView("student");
        } else {
          window.location.hash = "#/auth";
        }
      } else if (h === "#/admin/dashboard") {
        if (token && currentUser?.email === "ritika@admin.tech") {
          setView("admin");
        } else {
          window.location.hash = "#/auth";
        }
      } else if (h === "#/auth/qs") {
        if (token) {
          setView("qs");
        } else {
          window.location.hash = "#/auth";
        }
      } else {
        setView("landing");
      }
    };

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [token]);

  // Sync state route to browser address location hash
  useEffect(() => {
    if (view === "landing") {
      window.location.hash = "";
    } else if (view === "auth") {
      window.location.hash = "#/auth";
    } else if (view === "qs") {
      window.location.hash = "#/auth/qs";
    } else if (view === "student") {
      const c = currentUser?.classSelection?.toLowerCase() || "class";
      const h = currentUser?.hashedAcc || "account";
      window.location.hash = `#/student/${c}/${h}`;
    } else if (view === "admin") {
      window.location.hash = "#/admin/dashboard";
    }
  }, [view, currentUser]);

  const fetchStudentStatus = async (userObj?: User) => {
    try {
      const activeUser = userObj || currentUser;
      const c = activeUser?.classSelection || "VIII";
      const b = activeUser?.higherStudies || "B.TECH";
      const query = `?class=${encodeURIComponent(c)}&batch=${encodeURIComponent(b)}`;
      const res = await fetch(`/api/student/dashboard-status${query}`);
      const data = await res.json();
      setNowStudying(data.nowStudying);
      setProgressPercent(data.progressPercent);
      setAnnouncements(data.announcements);
    } catch (e) {
      console.warn("Could not fetch status stats", e);
    }
  };

  const fetchParentAlerts = async (authToken: string) => {
    try {
      const res = await fetch("/api/student/my-reports", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setParentAlerts(data.complaints);
      }
    } catch (e) {
      console.warn("Could not locate customized warning bulletins", e);
    }
  };

  const fetchAdminDashboard = async (authToken: string) => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setAdminStudents(data.students);
        setAdminComplaints(data.complaints);
        setAnnouncements(data.announcements);
        setAdminNowStudying(data.adminSettings.nowStudying);
        setAdminProgressPercent(data.adminSettings.progressPercent);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers ---

  const handleLogout = () => {
    localStorage.removeItem("JWT-TOKEN");
    setToken(null);
    setCurrentUser(null);
    setView("landing");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setAuthSuccess("");
    setOtpSent(false);
  };

  // 1. Submit email/pass for Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authEmail || !authPassword) {
      setAuthError("Please fill out all fields.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Failed to register user");
        return;
      }

      setOtpSent(true);
      setReceivedOtpFromServer(data.otp); // Save the returned mock OTP so sandbox users can see and click it instantly!
      setAuthSuccess("A verification code (OTP) was simulated via NodeMailer. Please verify below.");
    } catch (err: any) {
      setAuthError("Connectivity error. Try again.");
    }
  };

  // 2. Submit OTP to complete register
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, otp: otpCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Verification failed");
        return;
      }

      localStorage.setItem("JWT-TOKEN", data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setView("qs"); // goes directly to student class questionnaire
      setAuthSuccess("Registered successfully!");
    } catch (err) {
      setAuthError("Failed to verify code.");
    }
  };

  // 3. User Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authEmail || !authPassword) {
      setAuthError("Email and Password are required.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Login credentials rejected.");
        return;
      }

      localStorage.setItem("JWT-TOKEN", data.token);
      setToken(data.token);

      if (data.isAdmin) {
        setCurrentUser({ id: "admin", email: "ritika@admin.tech" });
        setView("admin");
        fetchAdminDashboard(data.token);
      } else {
        setCurrentUser(data.user);
        if (data.user.classSelection) {
          setView("student");
          // Pre-populate
          if (data.user.studentInfo) {
            setInfoName(data.user.studentInfo.studentName);
            setInfoClass(data.user.studentInfo.className);
            setInfoAge(data.user.studentInfo.age);
            setInfoParent(data.user.studentInfo.parentName);
            setInfoPhone(data.user.studentInfo.phoneNumber);
            setInfoUserImg(data.user.studentInfo.userImg || "");
            setInfoResultPic(data.user.studentInfo.resultPic || "");
          }
          fetchParentAlerts(data.token);
        } else {
          setView("qs");
        }
      }
    } catch (err) {
      setAuthError("Network server interaction failed.");
    }
  };

  // 4. Submit class selection questionnaire (/auth/qs)
  const handleQsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQsError("");

    try {
      const res = await fetch("/api/student/submit-qs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ classSelection: qsClass, higherStudies: qsHigherStudies }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setQsError(data.error || "Could not record selection");
        return;
      }

      // Update current user details
      if (currentUser) {
        const updated = { ...currentUser, classSelection: qsClass, higherStudies: qsHigherStudies };
        setCurrentUser(updated);
        // Pre-fill student info fields with email name default
        setInfoName(currentUser.email.split("@")[0]);
        setInfoClass(qsClass);
        fetchStudentStatus(updated);
      }
      
      setView("student");
    } catch (err) {
      setQsError("Submission failed.");
    }
  };

  // 5. Submit deep student card profile (Image 4 StudentInfo)
  const handleStudentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess("");

    if (!infoName || !infoClass || !infoAge || !infoParent || !infoPhone || !infoResultPic) {
      setInfoSuccess("⚠️ Error: Name, Class, Age, Parent, Phone, and Result Card (*) are mandatory.");
      return;
    }

    try {
      const res = await fetch("/api/student/submit-info", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userImg: infoUserImg,
          resultPic: infoResultPic,
          studentName: infoName,
          className: infoClass,
          age: infoAge,
          parentName: infoParent,
          phoneNumber: infoPhone,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setInfoSuccess("⚠️ Failed to update database profile.");
        return;
      }

      if (currentUser) {
        setCurrentUser({ ...currentUser, studentInfo: data.studentInfo });
      }

      setInfoSuccess("✨ Student Profile saved to database successfully!");
      // Automatically navigate to study dashboard tab to view updates
      setTimeout(() => {
        setStudentActiveTab("dashboard");
        setInfoSuccess("");
      }, 1500);

    } catch (err) {
      setInfoSuccess("⚠️ Error communicating with cache.");
    }
  };

  // 6. Submit a customer / student complaint (Image 5)
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSuccess("");

    const targetEmail = currentUser?.email || guestEmail;
    const targetClass = currentUser?.classSelection || guestClass;

    if (!targetEmail || !guestComplaint) {
      setComplaintSuccess("⚠️ Error: Email and complaint are required.");
      return;
    }

    try {
      const res = await fetch("/api/student/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: targetEmail,
          className: targetClass,
          complaintText: guestComplaint,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComplaintSuccess("✨ Complaint processed to admin dashboard!");
        setGuestComplaint("");
        // Refresh admin counters if admin is logged in
        if (token && currentUser?.email === "ritika@admin.tech") {
          fetchAdminDashboard(token);
        }
      }
    } catch (e) {
      setComplaintSuccess("⚠️ Could not process feedback.");
    }
  };

  // 7. Admin updates studie text & dynamic progression percent (Image 4 controls)
  const handleAdminUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nowStudying: adminNowStudying,
          progressPercent: adminProgressPercent,
          targetClass: trackTargetClass,
          targetBatch: trackTargetBatch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (trackTargetClass === "All" || trackTargetClass === currentUser?.classSelection) {
          setNowStudying(adminNowStudying);
          setProgressPercent(adminProgressPercent);
        }
        alert(`Success: Learning stats updated for Class ${trackTargetClass} / Batch ${trackTargetBatch}!`);
        fetchStudentStatus();
      }
    } catch (err) {
      alert("Error writing values to live configuration");
    }
  };

  // Pre-populate admin states when target class / batch changes
  useEffect(() => {
    const fetchSpecificTrack = async () => {
      if (view === "admin" && trackTargetClass && trackTargetBatch) {
        try {
          const res = await fetch(`/api/student/dashboard-status?class=${encodeURIComponent(trackTargetClass)}&batch=${encodeURIComponent(trackTargetBatch)}`);
          const data = await res.json();
          setAdminNowStudying(data.nowStudying || "");
          setAdminProgressPercent(data.progressPercent ?? 20);
        } catch (e) {
          console.warn("Could not fetch specific track settings", e);
        }
      }
    };
    fetchSpecificTrack();
  }, [trackTargetClass, trackTargetBatch, view]);

  // 8. Admin posts dynamic Homework/Announcement (Image 5 text instructions)
  const handleAdminPublishAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAnnTitle || !adminAnnContent) {
      alert("Please specify a title and message content.");
      return;
    }

    try {
      const res = await fetch("/api/admin/add-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: adminAnnTitle,
          content: adminAnnContent,
          type: adminAnnType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
        setAdminAnnTitle("");
        setAdminAnnContent("");
        alert("Updates published instantly!");
      }
    } catch (err) {
      alert("Error printing changes.");
    }
  };

  // 8b. Poster to submit parental complaints on student (Image 5/3 requirements)
  const handleAdminPostComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCompSuccess("");
    if (!adminCompStudentEmail || !adminCompText) {
      alert("Please select/enter the student's email and warning content.");
      return;
    }
    try {
      const res = await fetch("/api/admin/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentEmail: adminCompStudentEmail,
          className: adminCompClass,
          complaintText: adminCompText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminCompSuccess("✨ Parental warning logged & dispatched successfully!");
        setAdminCompText("");
        // Refresh complaints list
        fetchAdminDashboard(token!);
      } else {
        alert(data.error || "Failed to record complaint warning");
      }
    } catch (err) {
      alert("Error sending warning metadata.");
    }
  };

  // 9. Quick interactive vocabulary search inside home screen
  const performInteractiveQuickSearch = (tech: string) => {
    setSearchCodeQuery(tech);
    if (tech.toLowerCase() === "c++") {
      setSearchedSyntaxResult(
        `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Welcome to Ritika's Tech Hub!" << endl;\n    return 0;\n}`
      );
    } else if (tech.toLowerCase() === "java") {
      setSearchedSyntaxResult(
        `public class RitikaTech {\n    public static void main(String[] args) {\n        System.out.println("Learn Every Code on Ritika.tech!");\n    }\n}`
      );
    } else if (tech.toLowerCase() === "python" || tech.toLowerCase() === "py") {
      setSearchedSyntaxResult(
        `def greet_student():\n    print("Welcome to Ritika's Tech Hub!")\n\ngreet_student()`
      );
    } else {
      setSearchedSyntaxResult(
        `// Search results for "${tech}"\nconsole.log("Ready to declare study schedules...");`
      );
    }
  };

  // Calculated stats for Admin dashboard
  const activeClassFormCounter = adminStudents.filter(u => {
    if (adminFilterClass === "All") return true;
    return u.classSelection?.toUpperCase() === adminFilterClass.toUpperCase();
  }).length;

  const totalRegisteredMockMultiplier = 110842 + adminStudents.length;

  // --- HTML Renders ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* Header element */}
      <Header 
        currentView={view} 
        onNavigate={(newV) => {
          setView(newV);
          // Auto scroll to main content helper
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        user={currentUser}
        onLogout={handleLogout}
        onOpenAboutModal={() => setShowAbout(true)}
        onOpenPricingModal={() => setShowPricing(true)}
        onOpenFeaturesModal={() => setShowFeatures(true)}
        onOpenStudentInfoTab={() => {
          setView("student");
          setStudentActiveTab("info");
        }}
        onOpenReachusTab={() => {
          setView("student");
          setStudentActiveTab("reachus");
        }}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start">
        
        {/* --- 1. LANDING PAGE VIEW --- */}
        {view === "landing" && (
          <div className="space-y-12">
            
            {/* Split Hero layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[550px]" id="landing-hero">
              
              {/* Left Column Text Details */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-400 bg-cyan-950/50 border border-cyan-500/30">
                    <Flame className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                    Now Online: Fully Serverless Cache Backend
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="font-display font-extrabold text-5xl md:text-7xl text-slate-100 tracking-tight leading-none">
                    Welcome <span className="text-cyan-400">.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
                    Build dynamic software paths, personalize academic progression, and access automated verified learning streams. 
                    <span className="text-white font-medium"> Learn Every Code</span>, anytime.
                  </p>
                </div>

                {/* Search / selector pill tabs input as sketched in Image 1 */}
                <div className="space-y-3 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl max-w-xl">
                  <p className="text-xs text-slate-400 font-mono">Select a technology to view code syntax instantly:</p>
                  <div className="flex gap-2 flex-wrap">
                    {["C++", "Java", "Python", "HTML"].map((tech) => (
                      <button
                        key={tech}
                        onClick={() => performInteractiveQuickSearch(tech)}
                        className={`text-xs px-4 py-2 rounded-xl transition-all font-mono border ${
                          searchCodeQuery.toUpperCase() === tech.toUpperCase()
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        Learn {tech}
                      </button>
                    ))}
                    
                    {/* Manual query */}
                    <div className="relative flex-1 min-w-[150px]">
                      <input
                        type="text"
                        placeholder="Search standard syntax..."
                        value={searchCodeQuery}
                        onChange={(e) => {
                          setSearchCodeQuery(e.target.value);
                          if (e.target.value) {
                            performInteractiveQuickSearch(e.target.value);
                          } else {
                            setSearchedSyntaxResult(null);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono pl-8"
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Reactive Code Sandbox Panel */}
                  <AnimatePresence>
                    {searchedSyntaxResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3 transition-all"
                      >
                        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-3.5 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner leading-relaxed">
                          <span className="absolute right-3 top-2.5 text-[8px] tracking-widest text-slate-600 uppercase font-bold">
                            Live Compiler Output
                          </span>
                          <pre>{searchedSyntaxResult}</pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3 Call-to-action buttons (Image 1 notes: Get Started, Already In? Sign In Header) */}
                <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                  <button
                    onClick={() => {
                      if (token) {
                        setView(currentUser?.classSelection ? "student" : "qs");
                      } else {
                        setView("auth");
                        setAuthTab("register");
                      }
                    }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/15 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>

                  <button
                    onClick={() => {
                      if (token) {
                        setView(currentUser?.classSelection ? "student" : "qs");
                      } else {
                        setView("auth");
                        setAuthTab("login");
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-sm font-medium border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Already In?
                  </button>
                </div>
              </div>

              {/* Right Column Concentric Topography Shapes (Image 1 Layout) */}
              <div className="lg:col-span-5 h-[400px]">
                <BackgroundPattern variant="topography" />
              </div>
            </div>

            {/* Core Features Overview section */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="font-display font-bold text-3xl text-slate-100">
                  Interactive Learning Capabilities
                </h2>
                <p className="text-sm text-slate-400">
                  Experience a state-of-the-art secure platform containing real-time synchronizations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-100">Live Active Counters</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Over +1,10,842 student records automatically sorted and filtered according to assigned classrooms.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-100 font-display">Student Progress Track</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monitor what class groups are studying. Admin publishes progress sliders visible directly on student metrics.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-100">Anonymous Security</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Secures JWT keys locally inside secure browsers while allowing students to submit feedback directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Guest Feedback Complaint Form (Image 5 right side form integration) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl" id="visitor-complaints-pnl">
              <div className="md:col-span-5 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <BadgeAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-100">
                  Student Support & Support Inbox
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experiencing any academic issues, missing schedule logs, or compiler setup problems? Submit an instant complaint. 
                </p>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-[11px] text-slate-400 font-mono">
                  💡 Announcements appear live under the student portal right after submission.
                </div>
              </div>

              <form onSubmit={handleComplaintSubmit} className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Your Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. johndoe@eg.com"
                      value={currentUser?.email || guestEmail}
                      disabled={!!currentUser}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-cyan-500 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Assigned Student Class</label>
                    <select
                      value={currentUser?.classSelection || guestClass}
                      disabled={!!currentUser}
                      onChange={(e) => setGuestClass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-cyan-500 disabled:opacity-50"
                    >
                      {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Detailed Complaint Message</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your query or complaint in details here..."
                    value={guestComplaint}
                    onChange={(e) => setGuestComplaint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {complaintSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{complaintSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-all active:scale-95 cursor-pointer"
                  >
                    Submit Complaint
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}


        {/* --- 2. AUTHENTICATION VIEW (/auth) --- */}
        {view === "auth" && (
          <div className="max-w-4xl w-full mx-auto bg-slate-900/60 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl" id="auth-panel-container">
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column Dynamic Gradients (Image 2 - "scroll continuously up" texture labels) */}
              <div className="md:col-span-5 h-[320px] md:h-full min-h-[450px]">
                <BackgroundPattern variant="scrolling-lines" />
              </div>

              {/* Right Column Login/Register Form Block */}
              <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
                
                {/* Tabs Selectors */}
                <div className="flex border-b border-slate-800">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 font-display uppercase transition-all ${
                      authTab === "login"
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sign In (Login)
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("register");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 font-display uppercase transition-all ${
                      authTab === "register"
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Open Account (Register)
                  </button>
                </div>

                {/* Form state explanations */}
                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-display text-slate-100">
                    {authTab === "login" ? "Verify Enrollment Cache" : "Create Fully Serverless Student Key"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {authTab === "login" 
                      ? "Admin access: ritika@admin.tech (pass: admin123). Students log here." 
                      : "Saves a secured JWT token locally. NodeMailer simulates safe verification code."}
                  </p>
                </div>

                {/* Active Error/Success alerts */}
                {authError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 font-mono">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 animate-bounce text-emerald-400" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Switch Login vs Register inputs */}
                {!otpSent ? (
                  <form onSubmit={authTab === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Username (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="johndoe@eg.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono focus:bg-slate-900/40 transition-all"
                        required
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono focus:bg-slate-900/40 transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {authTab === "login" ? "Sign In" : "Register with Nodemailer OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Verification Notification Box */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono">
                      <div className="flex items-center justify-between">
                        <span>✉️ Verification Dispatch System:</span>
                        <span className="text-[9px] bg-cyan-700/50 px-2 py-0.5 rounded text-white uppercase font-bold animate-pulse">Email Sent</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        A secure 6-digit verification code was dispatched to <strong className="text-white">{authEmail}</strong>. Please check your inbox and enter the code below to complete registration.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        6-Digit Security Code (OTP)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center tracking-widest text-lg font-bold bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-cyan-400 focus:outline-hidden focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setAuthSuccess("");
                        }}
                        className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs uppercase"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-md active:scale-95"
                      >
                        Verify & Login
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}


        {/* --- 3. CLASS & STUDIES QUESTIONNAIRE FLOW (/auth/qs) --- */}
        {view === "qs" && (
          <div className="max-w-xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl" id="questionnaire-pnl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Code className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-100">Class Selection Form</h2>
              <p className="text-xs text-slate-400">
                Please declare academic levels to customize progress streams in accordance to student indexes.
              </p>
            </div>

            {qsError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{qsError}</span>
              </div>
            )}

            <form onSubmit={handleQsSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Class Selection *
                </label>
                <select
                  value={qsClass}
                  onChange={(e) => setQsClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 focus:bg-slate-900/60 transition-all font-mono"
                >
                  {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((std) => (
                    <option key={std} value={std}>Class {std}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Declares your targeted class cohort.</p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Higher Studies Path
                </label>
                <select
                  value={qsHigherStudies}
                  onChange={(e) => setQsHigherStudies(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 focus:bg-slate-900/60 transition-all font-mono"
                >
                  <option value="B.TECH">B.TECH (Bachelor of Technology)</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="CST">CST (Computer Science and Technology)</option>
                  <option value="BSC">BSC (Bachelor of Science)</option>
                  <option value="Other / School Level">Other Academic Level</option>
                </select>
              </div>

              {/* Blinking Console layout as handsketched in Image 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5 font-mono">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="text-[11px] text-yellow-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Batch allocation:</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold pl-2 bg-slate-900 py-1.5 pr-2 rounded border border-slate-850 flex items-center justify-between">
                  <span className="animate-blink font-mono tracking-wide">
                    console.log("Will be declared");
                  </span>
                  <span className="text-[8px] bg-emerald-900/50 text-emerald-400 px-1.5 rounded uppercase">Active Blinker</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Submit declaration
              </button>
            </form>
          </div>
        )}


        {/* --- 4. STUDENT DASHBOARD VIEW (/student/class/hashedacc) --- */}
        {view === "student" && currentUser && (
          <div className="space-y-6">
            
            {/* Header / quick status tabs inside student view */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-850 p-4 rounded-2xl">
              <div>
                <span className="text-xs text-cyan-400 font-mono uppercase tracking-wider">Student Profile View</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Class {currentUser.classSelection} Portal</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    /{currentUser.classSelection?.toLowerCase()}/{currentUser.hashedAcc}
                  </span>
                </h2>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {["dashboard", "info", "reachus"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStudentActiveTab(tab as any)}
                    className={`flex-1 sm:flex-initial text-xs px-4 py-2 rounded-xl transition-all font-mono font-medium border uppercase ${
                      studentActiveTab === tab
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {tab === "reachus" ? "Reachus & Updates" : tab === "info" ? "Student Info Form" : "Live Study Dashboard"}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Student: Dynamic study progress area (Image 3 Bottom layout details) --- */}
            {studentActiveTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* Parent Alert Notifications (Image 3/5 instructions: Warning memos for parent display) */}
                {parentAlerts.length > 0 && (
                  <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/40 border border-rose-500/30 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                    <div className="flex items-center gap-2">
                      <BadgeAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                      <h3 className="font-bold font-display text-sm uppercase tracking-wider text-rose-200">
                        Official Academic Warning / Parent Complaint Alert
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      The administrator has logged the following warning memos requesting parental supervision and follow-up:
                    </p>
                    <div className="space-y-2">
                      {parentAlerts.map((alertItem) => (
                        <div 
                          key={alertItem.id} 
                          className="bg-slate-950/80 border border-rose-500/10 p-4 rounded-2xl space-y-2 animate-pulse-slow"
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                              Class {alertItem.className} Complaint Ticket
                            </span>
                            <span className="text-slate-500">
                              Logged on {new Date(alertItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-mono leading-relaxed pl-1">
                            "{alertItem.complaintText}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left study information block */}
                  <div className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-2.5 py-1 rounded-full uppercase">
                        🖥️ Current Stream Program
                      </span>
                      
                      <h3 className="font-display font-bold text-3xl text-slate-50 tracking-tight leading-tight">
                        NOW, They are studying:
                      </h3>

                      {/* Rich text block with admin-only disclaimer */}
                      <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full" />
                        
                        <p className="text-base text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                          {nowStudying}
                        </p>

                        <div className="border-t border-slate-800/80 mt-4 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>// can be updated only by admin</span>
                          <span className="text-xs text-yellow-500/75 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded bg-yellow-500 animate-ping" />
                            Announcements Live stream
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bullet / lists of homeworks / announcements from admin */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                        🏫 Recent Announcements & Tasks ({announcements.length})
                      </h4>

                      {announcements.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No announcements declared yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {announcements.map((ann) => (
                            <div 
                              key={ann.id} 
                              className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-start gap-2 text-xs"
                            >
                              <span className={`px-2 py-0.5 text-[9px] rounded font-mono font-bold ${
                                ann.type === "homework" ? "bg-amber-500/10 text-amber-400" :
                                ann.type === "change" ? "bg-cyan-500/10 text-cyan-400" :
                                "bg-slate-800 text-slate-300"
                              }`}>
                                {ann.type}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{ann.title}</p>
                                <p className="text-slate-400 text-[11px] mt-0.5">{ann.content}</p>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(ann.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Progress percentage (Image 3 Right Circle details) */}
                  <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-display font-medium text-slate-100 text-base">Academic Progression</h3>
                      <p className="text-[11px] text-slate-400 font-mono">// Live student indicator</p>
                    </div>

                    {/* SVG circular progress ring matching layout precisely */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Trail circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#1e293b"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Value ring progression bar */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#06b6d4" // cyan-500
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Progress</span>
                        <span className="font-display font-bold text-3xl text-cyan-400 tracking-tight">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full p-3 bg-slate-950 rounded-2xl border border-slate-850 text-center">
                      <span className="text-[11px] font-mono text-cyan-400/80">Batch: {currentUser.higherStudies || "Academic Core"}</span>
                    </div>
                  </div>

                </div>
              </div>
            )}


            {/* --- Student: Student Extra Info Form (Image 4 instructions) --- */}
            {studentActiveTab === "info" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 max-w-2xl mx-auto" id="profile-info-panel">
                <div className="space-y-1.5 text-center">
                  <h3 className="text-xl font-bold font-display text-white">Student Information Card</h3>
                  <p className="text-xs text-slate-400">
                    Submit complete profiles (personal photo, name, age, parents, and result cards) to synchronize with teacher dashboard catalogs.
                  </p>
                </div>

                {infoSuccess && (
                  <div className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    infoSuccess.includes("⚠️") ? "bg-rose-500/10 border border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  }`}>
                    {infoSuccess.includes("⚠️") ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{infoSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleStudentInfoSubmit} className="space-y-4">
                  
                  {/* Two separate image upload widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-950 border border-slate-850">
                    
                    {/* 1. Pupil Profile avatar / User Image - OPTIONAL (not starred) */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Student Portrait Photo <span className="text-slate-500 lowercase">(optional)</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={infoUserImg || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
                            alt="Student Avatar" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 bg-slate-900 shadow-md"
                          />
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setInfoUserImg(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste profile image web URL..."
                          value={infoUserImg}
                          onChange={(e) => setInfoUserImg(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-mono focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* 2. Gradesheet / Result pic upload - MANDATORY (red asterisk *) */}
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-850 pt-4 md:pt-0 md:pl-6">
                      <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                        Result Card / Marksheet Image <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={infoResultPic || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop"} 
                            alt="Result Card Proof" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-cyan-500/50 bg-slate-900 shadow-md"
                          />
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setInfoResultPic(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-[10px] text-cyan-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900"
                              required={!infoResultPic}
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste report card image web URL..."
                          value={infoResultPic || ""}
                          onChange={(e) => setInfoResultPic(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-mono focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase">Student Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={infoName}
                        onChange={(e) => setInfoName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase">Class Level</label>
                      <select
                        value={infoClass}
                        onChange={(e) => setInfoClass(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-hidden"
                      >
                        {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((st) => (
                          <option key={st} value={st}>Class {st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase">Age *</label>
                      <input
                        type="number"
                        placeholder="16"
                        value={infoAge}
                        onChange={(e) => setInfoAge(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase">Parent Name *</label>
                      <input
                        type="text"
                        placeholder="Mr. and Mrs. Doe"
                        value={infoParent}
                        onChange={(e) => setInfoParent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={infoPhone}
                      onChange={(e) => setInfoPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
                  >
                    Save Student Profile Info
                  </button>
                </form>
              </div>
            )}


            {/* --- Student: Reachus Complaints section (Image 5 descriptions & layout template) --- */}
            {studentActiveTab === "reachus" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Complaints filing card */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-lg text-white">Student Complaints & Help Desk</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Need administrator assist? File complaints anonymously. Our office handles resolves dynamically inside sorted directory panels.
                    </p>
                  </div>

                  {complaintSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400">
                      {complaintSuccess}
                    </div>
                  )}

                  <form onSubmit={handleComplaintSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Student Email</label>
                      <input
                        type="text"
                        value={currentUser.email}
                        disabled
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Assigned Class</label>
                      <input
                        type="text"
                        value={currentUser.classSelection}
                        disabled
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Detailed Complaint/Ticket</label>
                      <textarea
                        rows={3}
                        value={guestComplaint}
                        onChange={(e) => setGuestComplaint(e.target.value)}
                        placeholder="Type complain details..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                    >
                      File Complaint
                    </button>
                  </form>
                </div>

                {/* Left side: Announcements stream ("Announcements / homework / details") */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-medium text-lg text-white">School Live announcements</h3>
                    <p className="text-[11px] text-slate-400 font-mono">// Title, Changes list or Homework alerts</p>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        className="bg-slate-950 border border-slate-850 p-4 rounded-2xl relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-cyan-500 to-indigo-500" />
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            ann.type === "homework" ? "bg-amber-500/10 text-amber-400" :
                            ann.type === "change" ? "bg-cyan-500/10 text-cyan-400" :
                            "bg-slate-800 text-slate-300"
                          }`}>
                            {ann.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mb-1">{ann.title}</h4>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Corner Popup Prompt reminder to submit missing profile forms (Image 4 "give a corner pop-up message to fill it") */}
            {!currentUser.studentInfo && !dismissedInfoPopup && (
              <div 
                className="fixed bottom-4 right-4 z-50 max-w-xs w-full bg-gradient-to-r from-rose-950/90 to-slate-900/90 backdrop-blur-md border border-rose-500/40 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-bounce"
                id="corner-info-popup"
              >
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Action Required</h4>
                  <p className="text-[11px] text-slate-300">
                    Your mandatory profile details (StudentInfo) are missing. Please complete it now!
                  </p>
                  <div className="flex gap-2 pt-1.5">
                    <button
                      onClick={() => {
                        setStudentActiveTab("info");
                        setDismissedInfoPopup(true);
                      }}
                      className="text-[10px] bg-rose-500 hover:bg-rose-400 text-white px-2.5 py-1 rounded font-bold transition-all"
                    >
                      Fill Form Now
                    </button>
                    <button
                      onClick={() => setDismissedInfoPopup(true)}
                      className="text-[10px] hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}


        {/* --- 5. ADMIN COMMAND PANEL VIEW (/admin/dashboard) --- */}
        {view === "admin" && currentUser?.email === "ritika@admin.tech" && (
          <div className="space-y-8" id="admin-pnl-root">
            
            {/* Header banner stats info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Admin Controls Dashboard</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Welcome, Ritika!</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  Adjust active progress percentage rings, publish homework, and track students sorted according to classes V-XII.
                </p>
              </div>

              {/* Dynamic Enrolled Count indicator */}
              <div className="bg-slate-950 border border-slate-850 px-5 py-3 rounded-2xl flex flex-col md:items-end">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Total Enrolled Counter</span>
                <span className="text-2xl font-bold text-cyan-400 font-display tracking-tight flex items-center gap-1">
                  <span>+{totalRegisteredMockMultiplier.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">students</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">// incremented automatically via forms</span>
              </div>
            </div>

            {/* Split panel workspace grids */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column Controls: Progress updater and announcements publisher */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Modify Study details & progress (Image 4 controls) */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-base text-white">Live Student Tracker Settings</h3>
                  </div>

                  <form onSubmit={handleAdminUpdateStatus} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                      <div>
                        <label className="block text-[10px] font-mono text-cyan-400 uppercase mb-1">
                          For Class
                        </label>
                        <select
                          value={trackTargetClass}
                          onChange={(e) => setTrackTargetClass(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-500"
                        >
                          <option value="All">All Classes</option>
                          {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-indigo-400 uppercase mb-1">
                          For Batch
                        </label>
                        <select
                          value={trackTargetBatch}
                          onChange={(e) => setTrackTargetBatch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="All">All Batches</option>
                          <option value="B.TECH">B.TECH</option>
                          <option value="BCA">BCA</option>
                          <option value="CST">CST</option>
                          <option value="BSC">BSC</option>
                          <option value="Other / School Level">Other Academic Level</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        What They Are Studying (NOW)
                      </label>
                      <textarea
                        rows={3}
                        value={adminNowStudying}
                        onChange={(e) => setAdminNowStudying(e.target.value)}
                        placeholder="Current lesson, homework deadlines or updates..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-hidden focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-mono text-slate-400 uppercase">
                          Progress Percentage Indicator
                        </label>
                        <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-950 border border-cyan-850/50 px-2 py-0.5 rounded">
                          {adminProgressPercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={adminProgressPercent}
                        onChange={(e) => setAdminProgressPercent(Number(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-950 rounded-full h-2 cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                    >
                      Update Live Site metrics
                    </button>
                  </form>
                </div>

                {/* 2. Publish announcements panel */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-base text-white">Publish New Announcement</h3>
                  </div>

                  <form onSubmit={handleAdminPublishAnn} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Type of update</label>
                      <div className="flex gap-2">
                        {["announcement", "homework", "change"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAdminAnnType(type as any)}
                            className={`flex-1 text-[10px] py-1.5 rounded-lg border font-mono font-bold uppercase transition-all ${
                              adminAnnType === type
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                                : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Update Title</label>
                      <input
                        type="text"
                        value={adminAnnTitle}
                        onChange={(e) => setAdminAnnTitle(e.target.value)}
                        placeholder="e.g. Recursion Homework Deadlines"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Message Content</label>
                      <textarea
                        rows={3}
                        value={adminAnnContent}
                        onChange={(e) => setAdminAnnContent(e.target.value)}
                        placeholder="Details of instructions, changes, etc..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase"
                    >
                      Publish Announcement
                    </button>
                  </form>
                </div>

                {/* 3. Post Parental Warn/Student Complaint (Image 3/5 guidelines) */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <FileWarning className="w-5 h-5 text-rose-400" />
                    <h3 className="font-semibold text-base text-white font-display">Post Student Warn / Parental Alert</h3>
                  </div>

                  {adminCompSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400 font-mono">
                      {adminCompSuccess}
                    </div>
                  )}

                  <form onSubmit={handleAdminPostComplaint} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        Student Email ID Address
                      </label>
                      <input
                        type="text"
                        list="registered-studs"
                        value={adminCompStudentEmail}
                        onChange={(e) => setAdminCompStudentEmail(e.target.value)}
                        placeholder="Select or enter student email..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                        required
                      />
                      <datalist id="registered-studs">
                        {adminStudents.map((s) => (
                          <option key={s.id} value={s.email}>
                            {s.studentInfo?.studentName ? `${s.email} (${s.studentInfo.studentName})` : s.email}
                          </option>
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        Select Class Level
                      </label>
                      <select
                        value={adminCompClass}
                        onChange={(e) => setAdminCompClass(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden"
                      >
                        {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((st) => (
                          <option key={st} value={st}>Class {st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        Complaint / Warning Note (For Parents)
                      </label>
                      <textarea
                        rows={3}
                        value={adminCompText}
                        onChange={(e) => setAdminCompText(e.target.value)}
                        placeholder="Detail the academic warnings, missing homeworks, low marks, disciplinary issues..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase cursor-pointer"
                    >
                      Post Action Complaint
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column Enrolled Student Directories & Complaints logs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 3. Students catalog Directory (Image 5 filter parameters) */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold text-base text-white">Student Registry Catalog</h3>
                    </div>

                    {/* Filter parameters */}
                    <div className="flex gap-1.5">
                      <select
                        value={adminFilterClass}
                        onChange={(e) => setAdminFilterClass(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-cyan-400 font-mono"
                      >
                        <option value="All">Class: All</option>
                        {["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map(c => (
                          <option key={c} value={c}>Class: {c}</option>
                        ))}
                      </select>

                      <select
                        value={adminFilterBatch}
                        onChange={(e) => setAdminFilterBatch(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-indigo-400 font-mono"
                      >
                        <option value="All">Batch: All</option>
                        <option value="Mon-Fri">Mon-Fri</option>
                        <option value="Sat-Sun">Sat-Sun</option>
                      </select>
                    </div>

                  </div>

                  {/* Filter and display listing of declared forms */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {adminStudents.filter(s => {
                      if (adminFilterClass !== "All" && s.classSelection?.toUpperCase() !== adminFilterClass.toUpperCase()) return false;
                      if (adminFilterBatch === "Mon-Fri" && s.higherStudies?.includes("School")) return false; // simulated
                      return true;
                    }).length === 0 ? (
                      <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-850 border-dashed text-xs text-slate-500">
                        No registered users match selected class filter.
                      </div>
                    ) : (
                      adminStudents.filter(s => {
                        if (adminFilterClass !== "All" && s.classSelection?.toUpperCase() !== adminFilterClass.toUpperCase()) return false;
                        return true;
                      }).map((stud) => (
                        <div 
                          key={stud.id} 
                          className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-800 transition-all font-mono text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={stud.studentInfo?.resultPic || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop"} 
                              alt="Result Pic" 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-800 bg-slate-900"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-sm">
                                  {stud.studentInfo?.studentName || stud.email.split("@")[0]}
                                </p>
                                <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                                  Class {stud.classSelection || "N/A"}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5 font-mono">{stud.email}</p>
                              <div className="flex gap-2 flex-wrap text-[10px] text-slate-500 mt-1">
                                <span>Age: {stud.studentInfo?.age || "N/A"}</span>
                                <span>• Parent: {stud.studentInfo?.parentName || "N/A"}</span>
                                <span>• Phone: {stud.studentInfo?.phoneNumber || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:border-l border-slate-850 sm:pl-4">
                            <span className="text-[10px] text-slate-500 font-mono block">Studies Track</span>
                            <span className="text-xs text-slate-300 font-bold">{stud.higherStudies || "Declaration Pending"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Support tickets & Complaints list (Image 5 complaint layout view detail) */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-semibold text-base text-white">Student Complaints Inbox</h3>
                    </div>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono font-bold">
                      {adminComplaints.length} pending ticket(s)
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {adminComplaints.length === 0 ? (
                      <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-850 border-dashed text-xs text-slate-500">
                        No active student complaints filed. We are clean!
                      </div>
                    ) : (
                      adminComplaints.map((comp) => (
                        <div 
                          key={comp.id} 
                          className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 relative"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold font-mono text-cyan-400">{comp.studentEmail}</p>
                              <p className="text-[10px] text-slate-500">Class {comp.className}</p>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(comp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-900 p-2.5 rounded border border-slate-850">
                            {comp.complaintText}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer info layout */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Ritika's Tech Hub. Learn Every Code. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">Fully serverless reactive local cache & NodeJS simulation storage.</p>
      </footer>


      {/* --- EXTRA DIALOG OVERLAYS (About, Pricing, Features Modals) --- */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4"
              id="about-m-overlay"
            >
              <h3 className="text-xl font-bold font-display text-white">About Ritika's Tech Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ritika's Tech Hub is a premium, fully simulated educational engine designed to modernize class assignments, progression trackers, and homework registries. 
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Using built-in local token encodings and interactive code compilations, the hub ensures students from Class V to XII have direct access to syntax foundations.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAbout(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-200 text-xs font-semibold"
                >
                  Close Dialog
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPricing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4"
              id="pricing-m-overlay"
            >
              <h3 className="text-xl font-bold font-display text-white">Academic Open Plans</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All Ritika's Tech Hub catalogs, code compiler widgets, and homework tracker tools are free as we are serverless!
              </p>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white">Lifetime Access Plan</h4>
                  <p className="text-[10px] text-slate-400">Classrooms V-XII inclusions</p>
                </div>
                <span className="text-xl font-extrabold text-cyan-400 font-display">Free / Open</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowPricing(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-200 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showFeatures && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4"
              id="features-m-overlay"
            >
              <h3 className="text-xl font-bold font-display text-white">Platform Features</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Interactive learning: C++, Java, & Py code output tools.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Admin live sync trackers & custom progress rings.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-400" />
                  <span>Detailed Profile submissions & Support centers.</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowFeatures(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
