"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Video,
  ChevronRight,
  Users,
  BookOpen,
  Award,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getUsers,
  getSubjects,
  createSession,
  createMessage,
} from "@/lib/storage";
import { User as UserType, Subject } from "@/lib/types";
import { getDayName } from "@/lib/utils";
import toast from "react-hot-toast";

export default function Discover() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMode, setSelectedMode] = useState<
    "all" | "in-person" | "video"
  >("all");
  const [maxRate, setMaxRate] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    duration: 60,
    mode: "video" as "video" | "in-person",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const allUsers = getUsers().filter((u) => u.id !== user.id);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      const allSubjects = getSubjects();
      setSubjects(allSubjects);
    }
  }, [user]);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter((u) => u.department === selectedDepartment);
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter((u) =>
        u.subjectsToTeach.some((s) => s.subjectId === selectedSubject)
      );
    }

    // Mode filter
    if (selectedMode !== "all") {
      filtered = filtered.filter(
        (u) => u.preferredMode === selectedMode || u.preferredMode === "both"
      );
    }

    // Rate filter
    if (maxRate !== null) {
      filtered = filtered.filter((u) => u.minRate <= maxRate);
    }

    // Sort by rating and match score
    filtered = filtered.sort((a, b) => {
      // Calculate match score
      let scoreA = 0;
      let scoreB = 0;

      if (user) {
        // Check if they can teach what user wants to learn
        user.subjectsToLearn.forEach((need) => {
          const expertiseA = a.subjectsToTeach.find(
            (e) => e.subjectId === need.subjectId
          );
          const expertiseB = b.subjectsToTeach.find(
            (e) => e.subjectId === need.subjectId
          );
          if (expertiseA) scoreA += expertiseA.proficiency * need.urgency;
          if (expertiseB) scoreB += expertiseB.proficiency * need.urgency;
        });
      }

      // Factor in rating
      scoreA += a.rating * 2;
      scoreB += b.rating * 2;

      return scoreB - scoreA;
    });

    setFilteredUsers(filtered);
  }, [
    searchTerm,
    selectedDepartment,
    selectedSubject,
    selectedMode,
    maxRate,
    users,
    user,
  ]);

  const departments = [...new Set(users.map((u) => u.department))];

  const handleBookSession = async () => {
    if (!user || !selectedUser || !bookingDetails.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledAt = new Date(
      `${bookingDetails.date}T${bookingDetails.time}`
    );

    const session = createSession({
      tutorId: selectedUser.id,
      learnerId: user.id,
      subjectId: bookingDetails.subject,
      scheduledAt: scheduledAt.toISOString(),
      duration: bookingDetails.duration,
      mode: bookingDetails.mode,
      status: "pending",
      amount: selectedUser.minRate * (bookingDetails.duration / 60),
      pointsAwarded: 0,
    });

    if (bookingDetails.message) {
      createMessage({
        senderId: user.id,
        receiverId: selectedUser.id,
        sessionId: session.id,
        content: bookingDetails.message,
      });
    }

    toast.success("Session request sent successfully!");
    setShowBookingModal(false);
    setSelectedUser(null);
    setBookingDetails({
      date: "",
      time: "",
      duration: 60,
      mode: "video",
      subject: "",
      message: "",
    });
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Discover Study Partners
          </h1>
          <p className="text-gray-600 mt-1">
            Find the perfect study buddy based on your needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, department, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {(selectedDepartment ||
                selectedSubject ||
                selectedMode !== "all" ||
                maxRate !== null) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Mode
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) =>
                    setSelectedMode(e.target.value as "video" | "in-person")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Modes</option>
                  <option value="in-person">In Person Only</option>
                  <option value="video">Video Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rate (₹/hr)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxRate || ""}
                  onChange={(e) =>
                    setMaxRate(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((tutorUser) => (
            <div
              key={tutorUser.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      tutorUser.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutorUser.name}`
                    }
                    alt={tutorUser.name}
                    className="h-16 w-16 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500"
                    onClick={() => router.push(`/profile/${tutorUser.id}`)}
                  />
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-indigo-600"
                      onClick={() => router.push(`/profile/${tutorUser.id}`)}
                    >
                      {tutorUser.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tutorUser.department} • Year {tutorUser.year}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-700 ml-1">
                          {tutorUser.rating.toFixed(1)} (
                          {tutorUser.totalReviews})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 ml-1">
                          {tutorUser.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {tutorUser.bio && (
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                    {tutorUser.bio}
                  </p>
                )}

                {/* Subjects they teach */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Can Teach
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tutorUser.subjectsToTeach.slice(0, 3).map((subject) => (
                      <span
                        key={subject.subjectId}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {getSubjectName(subject.subjectId)}
                      </span>
                    ))}
                    {tutorUser.subjectsToTeach.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{tutorUser.subjectsToTeach.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability and Rate */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-600">
                      {tutorUser.preferredMode === "video" ? (
                        <Video className="h-4 w-4 mr-1" />
                      ) : tutorUser.preferredMode === "in-person" ? (
                        <MapPin className="h-4 w-4 mr-1" />
                      ) : (
                        <Users className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs">
                        {tutorUser.preferredMode === "both"
                          ? "Both"
                          : tutorUser.preferredMode === "video"
                          ? "Video"
                          : "In Person"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">
                        {tutorUser.minRate === 0
                          ? "Free"
                          : `₹${tutorUser.minRate}/hr`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(tutorUser);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Book Session
                  </button>
                  <Link
                    href={`/profile/${tutorUser.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Book a Session
              </h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Booking with</p>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={
                      selectedUser.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`
                    }
                    alt={selectedUser.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedUser.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedUser.minRate === 0
                        ? "Free Session"
                        : `₹${selectedUser.minRate}/hr`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={bookingDetails.subject}
                  onChange={(e) =>
                    setBookingDetails({
                      ...bookingDetails,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a subject</option>
                  {selectedUser.subjectsToTeach.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {getSubjectName(subject.subjectId)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        date: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={bookingDetails.time}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={bookingDetails.duration}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={bookingDetails.mode}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        mode: e.target.value as "video" | "in-person",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {(selectedUser.preferredMode === "both" ||
                      selectedUser.preferredMode === "video") && (
                      <option value="video">Video Call</option>
                    )}
                    {(selectedUser.preferredMode === "both" ||
                      selectedUser.preferredMode === "in-person") && (
                      <option value="in-person">In Person</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={bookingDetails.message}
                  onChange={(e) =>
                    setBookingDetails({
                      ...bookingDetails,
                      message: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce yourself or mention specific topics you'd like to cover..."
                />
              </div>

              {selectedUser.minRate > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Session Cost:</strong> ₹
                    {selectedUser.minRate * (bookingDetails.duration / 60)}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Payment will be handled after session confirmation
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleBookSession}
                  disabled={
                    !bookingDetails.subject ||
                    !bookingDetails.date ||
                    !bookingDetails.time
                  }
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Send Request
                </button>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedUser(null);
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
