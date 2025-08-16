"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  Bell,
  ChevronRight,
  Plus,
  UserCheck,
  Gift,
} from "lucide-react";
import Link from "next/link";
import {
  getSessionsByUserId,
  getNotificationsByUserId,
  getReviewsByUserId,
  findMatches,
  getSubjectById,
  getUserById,
  getSubjects,
} from "@/lib/storage";
import { Session, Notification, User as UserType, Subject } from "@/lib/types";
import { formatDateTime, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<UserType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Load user's sessions
      const userSessions = getSessionsByUserId(user.id);
      setSessions(userSessions);

      // Filter upcoming sessions
      const upcoming = userSessions
        .filter(
          (s) =>
            s.status === "confirmed" && new Date(s.scheduledAt) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );
      setUpcomingSessions(upcoming.slice(0, 3));

      // Load notifications
      const userNotifications = getNotificationsByUserId(user.id);
      setNotifications(userNotifications.slice(0, 5));

      // Load suggested matches
      const matches = findMatches(user.id);
      setSuggestedMatches(matches.slice(0, 4));

      // Load subjects
      const allSubjects = getSubjects();
      setSubjects(allSubjects);
    }
  }, [user]);

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

  const stats = [
    {
      label: "Total Points",
      value: user.points,
      icon: Award,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Sessions Completed",
      value: sessions.filter((s) => s.status === "completed").length,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Your Rating",
      value: user.rating.toFixed(1),
      icon: Star,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Total Reviews",
      value: user.totalReviews,
      icon: MessageCircle,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getUserName = (userId: string) => {
    if (userId === user.id) return "You";
    const otherUser = getUserById(userId);
    return otherUser?.name || "Unknown User";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s your learning dashboard overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/discover"
                  className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    Find Study Partners
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Plus className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-gray-900">
                    Update Subjects
                  </span>
                </Link>
                <Link
                  href="/sessions"
                  className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-gray-900">
                    View Sessions
                  </span>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <MessageCircle className="h-6 w-6 text-yellow-600" />
                  <span className="font-medium text-gray-900">
                    Check Messages
                  </span>
                </Link>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Sessions
                </h2>
                <Link
                  href="/sessions"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getSubjectName(session.subjectId)}
                          </p>
                          <p className="text-sm text-gray-600">
                            with{" "}
                            <span
                              className="text-indigo-600 cursor-pointer hover:underline"
                              onClick={() => {
                                const partnerId =
                                  session.tutorId === user.id
                                    ? session.learnerId
                                    : session.tutorId;
                                if (partnerId !== user.id) {
                                  router.push(`/profile/${partnerId}`);
                                }
                              }}
                            >
                              {getUserName(
                                session.tutorId === user.id
                                  ? session.learnerId
                                  : session.tutorId
                              )}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDateTime(session.scheduledAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {session.mode === "video"
                            ? "Video Call"
                            : "In Person"}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming sessions</p>
                  <Link
                    href="/discover"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Find study partners →
                  </Link>
                </div>
              )}
            </div>

            {/* Suggested Matches */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Suggested Study Partners
                </h2>
                <Link
                  href="/discover"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  See more
                </Link>
              </div>
              {suggestedMatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedMatches.map((match) => (
                    <div
                      key={match.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={
                            match.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.name}`
                          }
                          alt={match.name}
                          className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500"
                          onClick={() => router.push(`/profile/${match.id}`)}
                        />
                        <div className="flex-1">
                          <h3
                            className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() => router.push(`/profile/${match.id}`)}
                          >
                            {match.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {match.department} • Year {match.year}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600 ml-1">
                                {match.rating.toFixed(1)}
                              </span>
                            </div>
                            {match.minRate === 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/profile/${match.id}`}
                        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No matches found</p>
                  <Link
                    href="/profile"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Update your subjects →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
                <Link
                  href="/notifications"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg ${
                        notif.isRead ? "bg-gray-50" : "bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Bell
                          className={`h-4 w-4 mt-0.5 ${
                            notif.isRead ? "text-gray-400" : "text-blue-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              notif.isRead
                                ? "text-gray-600"
                                : "text-gray-900 font-medium"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No new notifications</p>
              )}
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Teaching Sessions</span>
                    <span className="font-medium text-gray-900">
                      {
                        sessions.filter(
                          (s) =>
                            s.tutorId === user.id && s.status === "completed"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          sessions.filter(
                            (s) =>
                              s.tutorId === user.id && s.status === "completed"
                          ).length * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Learning Sessions</span>
                    <span className="font-medium text-gray-900">
                      {
                        sessions.filter(
                          (s) =>
                            s.learnerId === user.id && s.status === "completed"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          sessions.filter(
                            (s) =>
                              s.learnerId === user.id &&
                              s.status === "completed"
                          ).length * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Next Reward</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {1000 - (user.points % 1000)} pts to go
                    </span>
                  </div>
                </div>
                <Link
                  href="/rewards"
                  className="block w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Redeem Points
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
