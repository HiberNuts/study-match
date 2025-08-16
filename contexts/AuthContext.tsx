"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import {
  login as storageLogin,
  logout as storageLogout,
  getCurrentUser,
  register as storageRegister,
  initializeStorage,
} from "@/lib/storage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    userData: Omit<
      User,
      "id" | "points" | "rating" | "totalReviews" | "joinedAt"
    >
  ) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize storage with mock data
    initializeStorage();

    // Check for existing user session
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = storageLogin(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        toast.success("Login successful!");
        return true;
      } else {
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      toast.error("Login failed");
      return false;
    }
  };

  const logout = () => {
    storageLogout();
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const register = async (
    userData: Omit<
      User,
      "id" | "points" | "rating" | "totalReviews" | "joinedAt"
    >
  ): Promise<User | null> => {
    try {
      const newUser = storageRegister(userData);
      setUser(newUser);
      toast.success("Registration successful! Welcome to Study Match!");
      return newUser;
    } catch (error) {
      toast.error("Registration failed");
      return null;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Note: In a real app, you'd also update this in storage
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
