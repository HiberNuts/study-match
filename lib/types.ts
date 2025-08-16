// Type definitions for Study Match app

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  universityId: string;
  department: string;
  year: number;
  bio?: string;
  profileImage?: string;
  points: number;
  minRate: number; // Minimum rate for tutoring (0 = free)
  preferredMode: "in-person" | "video" | "both";
  subjectsToTeach: SubjectExpertise[];
  subjectsToLearn: SubjectNeed[];
  availability: Availability[];
  rating: number;
  totalReviews: number;
  joinedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  department?: string;
}

export interface SubjectExpertise {
  subjectId: string;
  proficiency: number; // 1-5 scale
  description?: string;
}

export interface SubjectNeed {
  subjectId: string;
  urgency: number; // 1-5 scale
  description?: string;
}

export interface Session {
  id: string;
  tutorId: string;
  learnerId: string;
  subjectId: string;
  scheduledAt: string;
  duration: number; // in minutes
  mode: "in-person" | "video";
  location?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meetingLink?: string;
  notes?: string;
  amount: number;
  pointsAwarded: number;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  sessionId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Availability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "session_request"
    | "session_confirmed"
    | "session_cancelled"
    | "session_reminder"
    | "new_message"
    | "new_review"
    | "points_earned"
    | "match_found";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Match {
  user: User;
  matchScore: number;
  commonSubjects: {
    subjectId: string;
    type: "teach" | "learn";
  }[];
  availability: boolean;
}
