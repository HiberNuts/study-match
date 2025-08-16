"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Bell,
  MessageCircle,
  BookOpen,
  Users,
  Award,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getNotificationsByUserId } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user) {
      const notifications = getNotificationsByUserId(user.id);
      setUnreadNotifications(notifications.filter((n) => !n.isRead).length);
    }
  }, [user]);

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BookOpen },
    { href: "/discover", label: "Discover", icon: Users },
    { href: "/sessions", label: "Sessions", icon: BookOpen },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">
                Study Match
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Points Display - Clickable to Rewards */}
            <Link
              href="/rewards"
              className="hidden sm:flex items-center space-x-1 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-full transition-colors"
            >
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">
                {user.points} pts
              </span>
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 text-gray-700 hover:text-blue-600"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <img
                src={
                  user.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-2 text-gray-700 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 mt-2">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    user.profileImage ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
