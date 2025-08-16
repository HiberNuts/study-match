"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Star,
  Plus,
  X,
  Edit2,
  Save,
  Clock,
  MapPin,
  Video,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  getSubjects,
  updateUser as updateUserInStorage,
  getReviewsByUserId,
} from "@/lib/storage";
import {
  Subject,
  SubjectExpertise,
  SubjectNeed,
  Availability,
  Review,
} from "@/lib/types";
import { getDayName } from "@/lib/utils";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    minRate: 0,
    preferredMode: "both" as "in-person" | "video" | "both",
    subjectsToTeach: [] as SubjectExpertise[],
    subjectsToLearn: [] as SubjectNeed[],
    availability: [] as Availability[],
  });
  const [newTeachSubject, setNewTeachSubject] = useState({
    subjectId: "",
    proficiency: 3,
    description: "",
  });
  const [newLearnSubject, setNewLearnSubject] = useState({
    subjectId: "",
    urgency: 3,
    description: "",
  });
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        bio: user.bio || "",
        minRate: user.minRate,
        preferredMode: user.preferredMode,
        subjectsToTeach: user.subjectsToTeach,
        subjectsToLearn: user.subjectsToLearn,
        availability: user.availability,
      });
      const allSubjects = getSubjects();
      setSubjects(allSubjects);
      const userReviews = getReviewsByUserId(user.id);
      setReviews(userReviews);
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    const updatedData = {
      ...user,
      ...editData,
    };

    updateUserInStorage(user.id, updatedData);
    updateUser(updatedData);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleAddTeachSubject = () => {
    if (!newTeachSubject.subjectId) {
      toast.error("Please select a subject");
      return;
    }

    // Check if already exists
    if (
      editData.subjectsToTeach.find(
        (s) => s.subjectId === newTeachSubject.subjectId
      )
    ) {
      toast.error("Subject already added");
      return;
    }

    setEditData({
      ...editData,
      subjectsToTeach: [...editData.subjectsToTeach, newTeachSubject],
    });
    setNewTeachSubject({ subjectId: "", proficiency: 3, description: "" });
  };

  const handleAddLearnSubject = () => {
    if (!newLearnSubject.subjectId) {
      toast.error("Please select a subject");
      return;
    }

    // Check if already exists
    if (
      editData.subjectsToLearn.find(
        (s) => s.subjectId === newLearnSubject.subjectId
      )
    ) {
      toast.error("Subject already added");
      return;
    }

    setEditData({
      ...editData,
      subjectsToLearn: [...editData.subjectsToLearn, newLearnSubject],
    });
    setNewLearnSubject({ subjectId: "", urgency: 3, description: "" });
  };

  const handleAddAvailability = () => {
    if (!newAvailability.startTime || !newAvailability.endTime) {
      toast.error("Please set start and end times");
      return;
    }

    setEditData({
      ...editData,
      availability: [...editData.availability, newAvailability],
    });
    setNewAvailability({ dayOfWeek: 1, startTime: "", endTime: "" });
  };

  const removeTeachSubject = (subjectId: string) => {
    setEditData({
      ...editData,
      subjectsToTeach: editData.subjectsToTeach.filter(
        (s) => s.subjectId !== subjectId
      ),
    });
  };

  const removeLearnSubject = (subjectId: string) => {
    setEditData({
      ...editData,
      subjectsToLearn: editData.subjectsToLearn.filter(
        (s) => s.subjectId !== subjectId
      ),
    });
  };

  const removeAvailability = (index: number) => {
    setEditData({
      ...editData,
      availability: editData.availability.filter((_, i) => i !== index),
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <img
                src={
                  user.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                alt={user.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                )}
                <p className="text-gray-600">
                  {user.department} • Year {user.year}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  ID: {user.universityId}
                </p>
              </div>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.points}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {user.rating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {user.totalReviews}
              </p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {user.minRate === 0 ? "Free" : `₹${user.minRate}/hr`}
              </p>
              <p className="text-sm text-gray-600">Rate</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Me</h2>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-600">
              {user.bio || "No bio added yet. Click edit to add one!"}
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preferences
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Mode
              </label>
              {isEditing ? (
                <select
                  value={editData.preferredMode}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      preferredMode: e.target.value as
                        | "in-person"
                        | "video"
                        | "both",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Both In-Person & Video</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="video">Video Call Only</option>
                </select>
              ) : (
                <p className="text-gray-900 flex items-center">
                  {user.preferredMode === "video" ? (
                    <>
                      <Video className="h-4 w-4 mr-2" /> Video Call
                    </>
                  ) : user.preferredMode === "in-person" ? (
                    <>
                      <MapPin className="h-4 w-4 mr-2" /> In Person
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" /> Both
                    </>
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rate (₹/hr)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.minRate}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      minRate: Number(e.target.value),
                    })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {user.minRate === 0 ? "Free" : `₹${user.minRate}/hr`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subjects to Teach */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subjects I Can Teach
          </h2>
          <div className="space-y-3">
            {editData.subjectsToTeach.map((subject) => (
              <div
                key={subject.subjectId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {getSubjectName(subject.subjectId)}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Proficiency: {"⭐".repeat(subject.proficiency)}
                    </span>
                    {subject.description && (
                      <span className="text-sm text-gray-500">
                        {subject.description}
                      </span>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeTeachSubject(subject.subjectId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="flex space-x-2">
                <select
                  value={newTeachSubject.subjectId}
                  onChange={(e) =>
                    setNewTeachSubject({
                      ...newTeachSubject,
                      subjectId: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTeachSubject.proficiency}
                  onChange={(e) =>
                    setNewTeachSubject({
                      ...newTeachSubject,
                      proficiency: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>⭐</option>
                  <option value={2}>⭐⭐</option>
                  <option value={3}>⭐⭐⭐</option>
                  <option value={4}>⭐⭐⭐⭐</option>
                  <option value={5}>⭐⭐⭐⭐⭐</option>
                </select>
                <button
                  onClick={handleAddTeachSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subjects to Learn */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subjects I Want to Learn
          </h2>
          <div className="space-y-3">
            {editData.subjectsToLearn.map((subject) => (
              <div
                key={subject.subjectId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {getSubjectName(subject.subjectId)}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Urgency: {"🔥".repeat(subject.urgency)}
                    </span>
                    {subject.description && (
                      <span className="text-sm text-gray-500">
                        {subject.description}
                      </span>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeLearnSubject(subject.subjectId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="flex space-x-2">
                <select
                  value={newLearnSubject.subjectId}
                  onChange={(e) =>
                    setNewLearnSubject({
                      ...newLearnSubject,
                      subjectId: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newLearnSubject.urgency}
                  onChange={(e) =>
                    setNewLearnSubject({
                      ...newLearnSubject,
                      urgency: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>🔥</option>
                  <option value={2}>🔥🔥</option>
                  <option value={3}>🔥🔥🔥</option>
                  <option value={4}>🔥🔥🔥🔥</option>
                  <option value={5}>🔥🔥🔥🔥🔥</option>
                </select>
                <button
                  onClick={handleAddLearnSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Availability
          </h2>
          <div className="space-y-2">
            {editData.availability.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {getDayName(slot.dayOfWeek)}: {slot.startTime} -{" "}
                    {slot.endTime}
                  </span>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeAvailability(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="flex space-x-2">
                <select
                  value={newAvailability.dayOfWeek}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      dayOfWeek: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
                <input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      startTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      endTime: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddAvailability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Edit Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  name: user.name,
                  bio: user.bio || "",
                  minRate: user.minRate,
                  preferredMode: user.preferredMode,
                  subjectsToTeach: user.subjectsToTeach,
                  subjectsToLearn: user.subjectsToLearn,
                  availability: user.availability,
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
