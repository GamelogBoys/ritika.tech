export interface User {
  id: string;
  email: string;
  classSelection?: string;
  higherStudies?: string;
  hashedAcc?: string;
  studentInfo?: StudentProfile;
}

export interface StudentProfile {
  resultPic: string; // The report card / result picture
  studentName: string;
  className: string;
  age: string;
  parentName: string;
  phoneNumber: string;
  userImg?: string; // Optional student avatar picture, not starred (*)
}

export interface Complaint {
  id: string;
  studentEmail: string;
  className: string;
  complaintText: string;
  createdAt: string;
  postedBy?: "student" | "visitor" | "admin";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "homework" | "announcement" | "change";
  createdAt: string;
}

export interface AdminSettings {
  nowStudying: string;
  progressPercent: number;
}

export type AppView = "landing" | "auth" | "qs" | "student" | "admin";
