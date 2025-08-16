import { User, Session, Review, Message, Notification, Subject } from "./types";
import {
  mockUsers,
  mockSubjects,
  mockSessions,
  mockReviews,
  mockMessages,
  mockNotifications,
} from "./mockData";

const STORAGE_KEYS = {
  CURRENT_USER: "studymatch_current_user",
  USERS: "studymatch_users",
  SUBJECTS: "studymatch_subjects",
  SESSIONS: "studymatch_sessions",
  REVIEWS: "studymatch_reviews",
  MESSAGES: "studymatch_messages",
  NOTIFICATIONS: "studymatch_notifications",
};

// Initialize mock data in localStorage if not present
export const initializeStorage = () => {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(mockSubjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mockSessions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(mockReviews));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mockMessages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(mockNotifications)
    );
  }
};

// Auth functions
export const login = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const register = (
  user: Omit<User, "id" | "points" | "rating" | "totalReviews" | "joinedAt">
): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `u${Date.now()}`,
    points: 100, // Welcome bonus
    rating: 0,
    totalReviews: 0,
    joinedAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  return newUser;
};

// User functions
export const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update current user if it's the same
    const currentUser = getCurrentUser();
    if (currentUser?.id === id) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(users[index])
      );
    }

    return users[index];
  }
  return null;
};

// Subject functions
export const getSubjects = (): Subject[] => {
  const subjectsStr = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  return subjectsStr ? JSON.parse(subjectsStr) : [];
};

export const getSubjectById = (id: string): Subject | null => {
  const subjects = getSubjects();
  return subjects.find((s) => s.id === id) || null;
};

// Session functions
export const getSessions = (): Session[] => {
  const sessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return sessionsStr ? JSON.parse(sessionsStr) : [];
};

export const getSessionsByUserId = (userId: string): Session[] => {
  const sessions = getSessions();
  return sessions.filter((s) => s.tutorId === userId || s.learnerId === userId);
};

export const createSession = (
  session: Omit<Session, "id" | "createdAt">
): Session => {
  const sessions = getSessions();
  const newSession: Session = {
    ...session,
    id: `sess${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  // Create notification for tutor
  createNotification({
    userId: session.tutorId,
    type: "session_request",
    title: "New Session Request",
    message: `You have a new tutoring request`,
    isRead: false,
  });

  return newSession;
};

export const updateSession = (
  id: string,
  updates: Partial<Session>
): Session | null => {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return sessions[index];
  }
  return null;
};

// Review functions
export const getReviews = (): Review[] => {
  const reviewsStr = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  return reviewsStr ? JSON.parse(reviewsStr) : [];
};

export const getReviewsByUserId = (userId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter((r) => r.revieweeId === userId);
};

export const createReview = (
  review: Omit<Review, "id" | "createdAt">
): Review => {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: `rev${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

  // Update user rating
  const userReviews = [...getReviewsByUserId(review.revieweeId), newReview];
  const avgRating =
    userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;
  updateUser(review.revieweeId, {
    rating: avgRating,
    totalReviews: userReviews.length,
  });

  // Create notification
  createNotification({
    userId: review.revieweeId,
    type: "new_review",
    title: "New Review",
    message: `You received a ${review.rating}-star review`,
    isRead: false,
  });

  return newReview;
};

// Message functions
export const getMessages = (): Message[] => {
  const messagesStr = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return messagesStr ? JSON.parse(messagesStr) : [];
};

export const getMessagesByUserId = (userId: string): Message[] => {
  const messages = getMessages();
  return messages.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
};

export const getConversation = (
  user1Id: string,
  user2Id: string
): Message[] => {
  const messages = getMessages();
  return messages
    .filter(
      (m) =>
        (m.senderId === user1Id && m.receiverId === user2Id) ||
        (m.senderId === user2Id && m.receiverId === user1Id)
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
};

export const createMessage = (
  message: Omit<Message, "id" | "createdAt" | "isRead">
): Message => {
  const messages = getMessages();
  const newMessage: Message = {
    ...message,
    id: `msg${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

  // Create notification
  createNotification({
    userId: message.receiverId,
    type: "new_message",
    title: "New Message",
    message: `You have a new message`,
    isRead: false,
  });

  return newMessage;
};

export const markMessagesAsRead = (userId: string, otherUserId: string) => {
  const messages = getMessages();
  messages.forEach((m) => {
    if (m.senderId === otherUserId && m.receiverId === userId) {
      m.isRead = true;
    }
  });
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

// Notification functions
export const getNotifications = (): Notification[] => {
  const notifsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifsStr ? JSON.parse(notifsStr) : [];
};

export const getNotificationsByUserId = (userId: string): Notification[] => {
  const notifications = getNotifications();
  return notifications
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const createNotification = (
  notif: Omit<Notification, "id" | "createdAt">
): Notification => {
  const notifications = getNotifications();
  const newNotif: Notification = {
    ...notif,
    id: `notif${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotif);
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(notifications)
  );
  return newNotif;
};

export const markNotificationAsRead = (id: string) => {
  const notifications = getNotifications();
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications)
    );
  }
};

// Matching functions
export const findMatches = (userId: string): User[] => {
  const currentUser = getUserById(userId);
  if (!currentUser) return [];

  const users = getUsers().filter((u) => u.id !== userId);
  const matches: { user: User; score: number }[] = [];

  users.forEach((user) => {
    let score = 0;

    // Check if user can teach what current user wants to learn
    currentUser.subjectsToLearn.forEach((need) => {
      const expertise = user.subjectsToTeach.find(
        (e) => e.subjectId === need.subjectId
      );
      if (expertise) {
        score += expertise.proficiency * need.urgency;
      }
    });

    // Check if current user can teach what user wants to learn
    user.subjectsToLearn.forEach((need) => {
      const expertise = currentUser.subjectsToTeach.find(
        (e) => e.subjectId === need.subjectId
      );
      if (expertise) {
        score += expertise.proficiency * need.urgency;
      }
    });

    // Boost score for same department
    if (user.department === currentUser.department) {
      score += 5;
    }

    // Consider rating
    score += user.rating * 2;

    if (score > 0) {
      matches.push({ user, score });
    }
  });

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((m) => m.user);
};

// Points and rewards
export const awardPoints = (userId: string, points: number, reason: string) => {
  const user = getUserById(userId);
  if (user) {
    updateUser(userId, { points: user.points + points });
    createNotification({
      userId,
      type: "points_earned",
      title: "Points Earned!",
      message: `You earned ${points} points for ${reason}`,
      isRead: false,
    });
  }
};
