"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Star,
  BookOpen,
  GraduationCap,
  DollarSign,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Video,
  Users,
  MessageSquare,
  Award,
} from "lucide-react";
import {
  getUserById,
  getReviewsByUserId,
  getSessionsByUserId,
  getSubjects,
} from "@/lib/storage";
import { User as UserType, Review, Session, Subject } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function UserProfile() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "subjects">(
    "about"
  );

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    loadProfileData();
  }, [currentUser, userId, router]);

  const loadProfileData = () => {
    const userProfile = getUserById(userId);
    if (!userProfile) {
      router.push("/discover");
      return;
    }

    setProfile(userProfile);

    // Load reviews
    const userReviews = getReviewsByUserId(userId);
    setReviews(userReviews);

    // Load completed sessions
    const sessions = getSessionsByUserId(userId);
    const completed = sessions.filter((s) => s.status === "completed");
    setCompletedSessions(completed);

    // Load subjects
    const allSubjects = getSubjects();
    setSubjects(allSubjects);

    setLoading(false);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const handleMessageUser = () => {
    router.push("/messages");
  };

  const handleBookSession = () => {
    router.push(`/discover?tutor=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const averageRating = calculateAverageRating();
  const totalSessions = completedSessions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${
                profile.profileImage || profile.name
              }`}
              alt={profile.name}
              className="h-24 w-24 rounded-full"
            />

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600">{profile.department}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                  </div>
                </div>

                {currentUser?.id !== profile.id && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleMessageUser}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                    <button
                      onClick={handleBookSession}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-gray-900">
                    {averageRating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalSessions}
              </div>
              <p className="text-sm text-gray-600">Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reviews.length}
              </div>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                <Award className="h-5 w-5 text-indigo-600" />
                {profile.points}
              </div>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "about"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "subjects"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Subjects
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "reviews"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bio
                  </h3>
                  <p className="text-gray-600">
                    {profile.bio || "No bio provided yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Session Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Minimum Rate: ₹{profile.minRate || 0}/hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {profile.preferredMode === "both" ? (
                        <>
                          <Users className="h-4 w-4" />
                          <span>
                            Available for both in-person and video sessions
                          </span>
                        </>
                      ) : profile.preferredMode === "video" ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span>Prefers video sessions</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          <span>Prefers in-person sessions</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {profile.availability && profile.availability.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Availability
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.availability.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <Clock className="h-4 w-4" />
                          <span>
                            {slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjects Tab */}
            {activeTab === "subjects" && (
              <div className="space-y-6">
                {profile.subjectsToTeach &&
                  profile.subjectsToTeach.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        Can Teach
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjectsToTeach.map((item) => (
                          <div
                            key={item.subjectId}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                          >
                            {getSubjectName(item.subjectId)}
                            {item.proficiency && (
                              <span className="ml-1 text-xs opacity-75">
                                ({item.proficiency})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {profile.subjectsToLearn &&
                  profile.subjectsToLearn.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        Wants to Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjectsToLearn.map((item) => (
                          <div
                            key={item.subjectId}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {getSubjectName(item.subjectId)}
                            {item.urgency && (
                              <span className="ml-1 text-xs opacity-75">
                                ({item.urgency})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {(!profile.subjectsToTeach ||
                  profile.subjectsToTeach.length === 0) &&
                  (!profile.subjectsToLearn ||
                    profile.subjectsToLearn.length === 0) && (
                    <p className="text-gray-600 text-center py-8">
                      No subjects listed yet.
                    </p>
                  )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No reviews yet. Be the first to book a session!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
