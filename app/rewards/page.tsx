"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  Coffee,
  BookOpen,
  ShoppingBag,
  Ticket,
  Gift,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getUserById, updateUser } from "@/lib/storage";
import { User as UserType } from "@/lib/types";
import toast from "react-hot-toast";

type RewardItem = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "canteen" | "library" | "bookstore" | "events" | "merch";
  icon: React.ReactNode;
  available: boolean;
  discount?: string;
};

const rewardItems: RewardItem[] = [
  // Canteen Items
  {
    id: "r1",
    name: "Free Coffee",
    description: "Redeem for a free coffee at the college canteen",
    pointsCost: 50,
    category: "canteen",
    icon: <Coffee className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r2",
    name: "Lunch Voucher ₹50",
    description: "Get ₹50 off on your lunch at the canteen",
    pointsCost: 100,
    category: "canteen",
    icon: <Coffee className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r3",
    name: "Snack Combo",
    description: "Free snack combo (samosa + tea/coffee)",
    pointsCost: 75,
    category: "canteen",
    icon: <Coffee className="h-6 w-6" />,
    available: true,
  },

  // Library Items
  {
    id: "r4",
    name: "Extended Book Loan",
    description: "Extend library book loan period by 1 week",
    pointsCost: 40,
    category: "library",
    icon: <Clock className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r5",
    name: "Priority Book Reservation",
    description: "Get priority access to reserve high-demand books",
    pointsCost: 150,
    category: "library",
    icon: <Star className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r6",
    name: "Late Fee Waiver",
    description: "Waive library late fees up to ₹100",
    pointsCost: 80,
    category: "library",
    icon: <BookOpen className="h-6 w-6" />,
    available: true,
  },

  // Bookstore Items
  {
    id: "r7",
    name: "10% Book Discount",
    description: "Get 10% off on any textbook purchase",
    pointsCost: 200,
    category: "bookstore",
    icon: <ShoppingBag className="h-6 w-6" />,
    available: true,
    discount: "10% OFF",
  },
  {
    id: "r8",
    name: "Stationery Voucher ₹100",
    description: "₹100 voucher for stationery items",
    pointsCost: 150,
    category: "bookstore",
    icon: <ShoppingBag className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r9",
    name: "Free Notebook Set",
    description: "Get a set of 5 college notebooks free",
    pointsCost: 120,
    category: "bookstore",
    icon: <BookOpen className="h-6 w-6" />,
    available: true,
  },

  // Events
  {
    id: "r10",
    name: "Tech Fest Entry",
    description: "Free entry to the annual tech fest",
    pointsCost: 300,
    category: "events",
    icon: <Ticket className="h-6 w-6" />,
    available: false,
  },
  {
    id: "r11",
    name: "Workshop Priority",
    description: "Priority registration for any workshop",
    pointsCost: 250,
    category: "events",
    icon: <Star className="h-6 w-6" />,
    available: true,
  },

  // Merchandise
  {
    id: "r12",
    name: "College T-Shirt",
    description: "Alliance University branded t-shirt",
    pointsCost: 500,
    category: "merch",
    icon: <Gift className="h-6 w-6" />,
    available: true,
  },
  {
    id: "r13",
    name: "Study Match Badge",
    description: "Exclusive Study Match achiever badge",
    pointsCost: 100,
    category: "merch",
    icon: <Award className="h-6 w-6" />,
    available: true,
  },
];

export default function Rewards() {
  const { user, updateUser: updateAuthUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userPoints, setUserPoints] = useState(0);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    loadUserPoints();
  }, [user, router]);

  const loadUserPoints = () => {
    if (!user) return;

    const currentUser = getUserById(user.id);
    if (currentUser) {
      setUserPoints(currentUser.points);
    }
    setLoading(false);
  };

  const handleRedeem = async (item: RewardItem) => {
    if (!user) return;

    if (userPoints < item.pointsCost) {
      toast.error("Insufficient points!");
      return;
    }

    setRedeeming(item.id);

    // Simulate redemption process
    setTimeout(() => {
      const updatedPoints = userPoints - item.pointsCost;
      const updatedUser = { ...user, points: updatedPoints };

      updateUser(user.id, { points: updatedPoints });
      updateAuthUser(updatedUser);
      setUserPoints(updatedPoints);

      toast.success(
        <div>
          <p className="font-semibold">Redemption Successful!</p>
          <p className="text-sm">
            You&apos;ve redeemed {item.name} for {item.pointsCost} points
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Check your email for the voucher code
          </p>
        </div>,
        { duration: 5000 }
      );

      setRedeeming(null);
    }, 1500);
  };

  const filteredItems =
    selectedCategory === "all"
      ? rewardItems
      : rewardItems.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: "all", name: "All Rewards", icon: <Gift className="h-4 w-4" /> },
    { id: "canteen", name: "Canteen", icon: <Coffee className="h-4 w-4" /> },
    { id: "library", name: "Library", icon: <BookOpen className="h-4 w-4" /> },
    {
      id: "bookstore",
      name: "Bookstore",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    { id: "events", name: "Events", icon: <Ticket className="h-4 w-4" /> },
    { id: "merch", name: "Merchandise", icon: <Award className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Rewards Center</h1>
              <p className="text-indigo-100">
                Redeem your Study Match points for exciting rewards!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-8 w-8" />
                  <span className="text-3xl font-bold">{userPoints}</span>
                </div>
                <p className="text-sm text-indigo-100">Available Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            How to Earn Points
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Complete Sessions</p>
                <p className="text-gray-600">Earn 50-100 points per session</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Give Reviews</p>
                <p className="text-gray-600">Get 10 points for each review</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Help Others</p>
                <p className="text-gray-600">Bonus points for teaching</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                !item.available ? "opacity-60" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      item.category === "canteen"
                        ? "bg-orange-100 text-orange-600"
                        : item.category === "library"
                        ? "bg-blue-100 text-blue-600"
                        : item.category === "bookstore"
                        ? "bg-green-100 text-green-600"
                        : item.category === "events"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.discount && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                      {item.discount}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-gray-900">
                      {item.pointsCost} pts
                    </span>
                  </div>

                  {item.available ? (
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={
                        userPoints < item.pointsCost || redeeming === item.id
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        userPoints >= item.pointsCost
                          ? redeeming === item.id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {redeeming === item.id ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Redeeming...
                        </span>
                      ) : userPoints >= item.pointsCost ? (
                        "Redeem"
                      ) : (
                        "Insufficient"
                      )}
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No rewards available in this category.
            </p>
          </div>
        )}

        {/* Terms */}
        <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Redeemed rewards are sent to your registered
            email with voucher codes. Points are non-transferable and expire at
            the end of each semester. For canteen and bookstore vouchers, show
            the email confirmation at the counter.
          </p>
        </div>
      </div>
    </div>
  );
}
