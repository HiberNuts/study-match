"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageCircle,
  DollarSign,
} from "lucide-react";
import {
  getSessionsByUserId,
  updateSession,
  getUserById,
  getSubjectById,
  createReview,
  awardPoints,
  createMessage,
} from "@/lib/storage";
import { Session, User as UserType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function Sessions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "pending" | "completed"
  >("upcoming");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const userSessions = getSessionsByUserId(user.id);
      setSessions(userSessions);
    }
  }, [user]);

  const handleAcceptSession = (sessionId: string) => {
    updateSession(sessionId, { status: "confirmed" });
    const updatedSessions = getSessionsByUserId(user!.id);
    setSessions(updatedSessions);
    toast.success("Session confirmed!");
  };

  const handleCancelSession = (sessionId: string) => {
    updateSession(sessionId, { status: "cancelled" });
    const updatedSessions = getSessionsByUserId(user!.id);
    setSessions(updatedSessions);
    toast.success("Session cancelled");
  };

  const handleCompleteSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    updateSession(sessionId, {
      status: "completed",
      pointsAwarded: 50,
    });

    // Award points
    if (user) {
      if (session.tutorId === user.id) {
        awardPoints(user.id, 50, "completing a tutoring session");
      } else {
        awardPoints(user.id, 30, "completing a learning session");
      }
    }

    const updatedSessions = getSessionsByUserId(user!.id);
    setSessions(updatedSessions);
    toast.success("Session marked as completed!");
  };

  const handleSubmitReview = () => {
    if (!selectedSession || !user) return;

    const revieweeId =
      selectedSession.tutorId === user.id
        ? selectedSession.learnerId
        : selectedSession.tutorId;

    createReview({
      sessionId: selectedSession.id,
      reviewerId: user.id,
      revieweeId: revieweeId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });

    // Award bonus points for leaving a review
    awardPoints(user.id, 10, "leaving a review");

    toast.success("Review submitted successfully!");
    setShowReviewModal(false);
    setSelectedSession(null);
    setReviewData({ rating: 5, comment: "" });
  };

  const getOtherUser = (session: Session): UserType | null => {
    const otherUserId =
      session.tutorId === user?.id ? session.learnerId : session.tutorId;
    return getUserById(otherUserId);
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = getSubjectById(subjectId);
    return subject?.name || "Unknown Subject";
  };

  const filteredSessions = sessions
    .filter((session) => {
      const now = new Date();
      const sessionDate = new Date(session.scheduledAt);

      switch (activeTab) {
        case "upcoming":
          return session.status === "confirmed" && sessionDate > now;
        case "pending":
          return session.status === "pending";
        case "completed":
          return (
            session.status === "completed" || session.status === "cancelled"
          );
        default:
          return false;
      }
    })
    .sort((a, b) => {
      if (activeTab === "completed") {
        return (
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );
      }
      return (
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage your tutoring and learning sessions
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "upcoming"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming
                {sessions.filter(
                  (s) =>
                    s.status === "confirmed" &&
                    new Date(s.scheduledAt) > new Date()
                ).length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    {
                      sessions.filter(
                        (s) =>
                          s.status === "confirmed" &&
                          new Date(s.scheduledAt) > new Date()
                      ).length
                    }
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Requests
                {sessions.filter((s) => s.status === "pending").length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                    {sessions.filter((s) => s.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "completed"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Past Sessions
              </button>
            </nav>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const otherUser = getOtherUser(session);
            const isTutor = session.tutorId === user.id;

            return (
              <div key={session.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {otherUser && (
                      <img
                        src={
                          otherUser.profileImage ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`
                        }
                        alt={otherUser.name}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {getSubjectName(session.subjectId)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isTutor
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isTutor ? "Teaching" : "Learning"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {isTutor ? "Student" : "Tutor"}:{" "}
                        {otherUser?.name || "Unknown"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDateTime(session.scheduledAt)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.duration} min
                        </span>
                        <span className="flex items-center">
                          {session.mode === "video" ? (
                            <>
                              <Video className="h-4 w-4 mr-1" />
                              Video Call
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 mr-1" />
                              {session.location || "In Person"}
                            </>
                          )}
                        </span>
                      </div>
                      {session.amount > 0 && (
                        <div className="flex items-center mt-2">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-600">
                            ₹{session.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {/* Status Badge */}
                    {session.status === "pending" && (
                      <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                    {session.status === "confirmed" && (
                      <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmed
                      </span>
                    )}
                    {session.status === "completed" && (
                      <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    )}
                    {session.status === "cancelled" && (
                      <span className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelled
                      </span>
                    )}

                    {/* Action Buttons */}
                    {session.status === "pending" && isTutor && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptSession(session.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {session.status === "confirmed" &&
                      new Date(session.scheduledAt) < new Date() && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Mark Complete
                        </button>
                      )}

                    {session.status === "completed" && (
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowReviewModal(true);
                        }}
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>

                {/* Meeting Link for confirmed video sessions */}
                {session.status === "confirmed" &&
                  session.mode === "video" &&
                  session.meetingLink && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Meeting Link:</strong>{" "}
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {session.meetingLink}
                        </a>
                      </p>
                    </div>
                  )}
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-600">
                {activeTab === "upcoming" &&
                  "You have no upcoming sessions scheduled"}
                {activeTab === "pending" && "No pending session requests"}
                {activeTab === "completed" && "No past sessions to show"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Leave a Review
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className="text-3xl focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewData.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedSession(null);
                    setReviewData({ rating: 5, comment: "" });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
