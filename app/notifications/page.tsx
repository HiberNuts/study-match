"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  MessageCircle,
  Star,
  Award,
  UserPlus,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import {
  getNotificationsByUserId,
  markNotificationAsRead,
} from "@/lib/storage";
import { Notification } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function Notifications() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = () => {
    if (!user) return;
    let userNotifications = getNotificationsByUserId(user.id);

    if (filter === "unread") {
      userNotifications = userNotifications.filter((n) => !n.isRead);
    }

    setNotifications(userNotifications);
  };

  const handleMarkAsRead = (notifId: string) => {
    markNotificationAsRead(notifId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.isRead) {
        markNotificationAsRead(notif.id);
      }
    });
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "session_request":
      case "session_confirmed":
      case "session_cancelled":
      case "session_reminder":
        return Calendar;
      case "new_message":
        return MessageCircle;
      case "new_review":
        return Star;
      case "points_earned":
        return Award;
      case "match_found":
        return UserPlus;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "session_request":
        return "text-yellow-600 bg-yellow-100";
      case "session_confirmed":
        return "text-green-600 bg-green-100";
      case "session_cancelled":
        return "text-red-600 bg-red-100";
      case "session_reminder":
        return "text-blue-600 bg-blue-100";
      case "new_message":
        return "text-purple-600 bg-purple-100";
      case "new_review":
        return "text-orange-600 bg-orange-100";
      case "points_earned":
        return "text-yellow-600 bg-yellow-100";
      case "match_found":
        return "text-indigo-600 bg-indigo-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const grouped = new Map<string, Notification[]>();

    notifications.forEach((notif) => {
      const date = formatDate(notif.createdAt);
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(notif);
    });

    return Array.from(grouped.entries());
  };

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

  const groupedNotifications = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your study activities
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {groupedNotifications.length > 0 ? (
          <div className="space-y-6">
            {groupedNotifications.map(([date, dateNotifications]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {date}
                </h3>
                <div className="space-y-3">
                  {dateNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`bg-white rounded-lg shadow p-4 ${
                          !notification.isRead
                            ? "border-l-4 border-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-medium text-gray-900 ${
                                !notification.isRead ? "font-semibold" : ""
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDateTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <button
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
