"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Users,
  Award,
  MessageCircle,
  Star,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const { user, login, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      }
    } else {
      const newUser = await register({
        email,
        password,
        name,
        universityId,
        department,
        year,
        bio: "",
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        minRate: 0,
        preferredMode: "both",
        subjectsToTeach: [],
        subjectsToLearn: [],
        availability: [],
      });
      if (newUser) {
        router.push("/dashboard");
      }
    }
  };

  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description:
        "Find the perfect study partner based on subjects, skills, and availability",
    },
    {
      icon: MessageCircle,
      title: "Easy Communication",
      description:
        "Built-in messaging to schedule sessions and share materials",
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description:
        "Get points for teaching and learning, redeem for campus perks",
    },
    {
      icon: Star,
      title: "Trusted Reviews",
      description: "Build your reputation with ratings and reviews from peers",
    },
  ];

  const departments = [
    "Computer Science",
    "Business Administration",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Arts & Humanities",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Psychology",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <GraduationCap className="h-16 w-16 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900">Study Match</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Alliance University&apos;s Peer Learning Platform
          </p>
          <p className="text-lg text-gray-500">
            Connect. Learn. Teach. Grow Together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Features Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Study Match?
            </h2>
            <div className="grid gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Demo Credentials */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-black mb-2">
                🎓 Demo Credentials
              </h3>
              <p className="text-sm text-gray-800 mb-2 font-medium">
                Try the app with these test accounts:
              </p>
              <div className="space-y-1 text-sm">
                <div
                  className="font-mono bg-yellow-100 p-2 rounded text-black font-semibold"
                  style={{ color: "black", fontWeight: "300" }}
                >
                  <strong style={{ color: "black" }}>Email:</strong>{" "}
                  aara@alliance.edu.in
                  <br />
                  <strong style={{ color: "black" }}>Password:</strong>{" "}
                  password123
                </div>
                <div
                  className="font-mono bg-yellow-100 p-2 rounded text-black font-semibold"
                  style={{ color: "black", fontWeight: "300" }}
                >
                  <strong style={{ color: "black" }}>Email:</strong>{" "}
                  priya.patel@alliance.edu.in
                  <br />
                  <strong style={{ color: "black" }}>Password:</strong>{" "}
                  password123
                </div>
              </div>
            </div>
          </div>

          {/* Login/Register Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isLogin
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  !isLogin
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-gray-600 bg-white"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      University ID
                    </label>
                    <input
                      type="text"
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-gray-600 bg-white"
                      placeholder="AU2024XXX001"
                      required={!isLogin}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-gray-600 bg-white"
                      required={!isLogin}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Study
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-gray-600 bg-white"
                      required={!isLogin}
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  placeholder="your.name@alliance.edu.in"
                  style={{ color: "black" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  placeholder=""
                  style={{ color: "black" }}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>
                  {isLogin ? "Login to Study Match" : "Join Study Match"}
                </span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Login here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
