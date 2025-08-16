"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send, Search, Clock, Check, MessageCircle } from "lucide-react";
import {
  getMessagesByUserId,
  getConversation,
  createMessage,
  markMessagesAsRead,
  getUserById,
  getUsers,
} from "@/lib/storage";
import { Message, User as UserType } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function Messages() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
      const users = getUsers().filter((u) => u.id !== user.id);
      setAllUsers(users);
    }
  }, [user]);

  const loadConversations = () => {
    if (!user) return;

    const messages = getMessagesByUserId(user.id);
    const convMap = new Map<string, Message[]>();

    messages.forEach((msg) => {
      const otherUserId =
        msg.senderId === user.id ? msg.receiverId : msg.senderId;
      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, []);
      }
      convMap.get(otherUserId)!.push(msg);
    });

    // Sort messages within each conversation
    convMap.forEach((msgs, userId) => {
      msgs.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    setConversations(convMap);

    // If a conversation was selected, reload it
    if (selectedUserId) {
      markMessagesAsRead(user.id, selectedUserId);
    }
  };

  const handleSendMessage = () => {
    if (!user || !selectedUserId || !newMessage.trim()) return;

    createMessage({
      senderId: user.id,
      receiverId: selectedUserId,
      content: newMessage.trim(),
    });

    setNewMessage("");
    loadConversations();
    toast.success("Message sent!");
  };

  const handleSelectUser = (userId: string) => {
    if (!user) return;
    setSelectedUserId(userId);
    markMessagesAsRead(user.id, userId);
    loadConversations();
  };

  const startNewConversation = (userId: string) => {
    setSelectedUserId(userId);
  };

  const getOtherUser = (userId: string): UserType | null => {
    return getUserById(userId);
  };

  const getLastMessage = (messages: Message[]): Message | null => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const getUnreadCount = (messages: Message[]): number => {
    if (!user) return 0;
    return messages.filter((m) => m.receiverId === user.id && !m.isRead).length;
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedConversations = Array.from(conversations.entries()).sort(
    (a, b) => {
      const lastMsgA = getLastMessage(a[1]);
      const lastMsgB = getLastMessage(b[1]);
      if (!lastMsgA || !lastMsgB) return 0;
      return (
        new Date(lastMsgB.createdAt).getTime() -
        new Date(lastMsgA.createdAt).getTime()
      );
    }
  );

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

  const selectedConversation = selectedUserId
    ? conversations.get(selectedUserId) || []
    : [];
  const selectedUser = selectedUserId ? getOtherUser(selectedUserId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Chat with your study partners</p>
        </div>

        <div
          className="bg-white rounded-lg shadow"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {searchTerm ? (
                  // Show search results
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Search Results
                    </p>
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => startNewConversation(u.id)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <img
                          src={
                            u.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                          }
                          alt={u.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500">
                            {u.department}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No users found
                      </p>
                    )}
                  </div>
                ) : (
                  // Show conversations
                  <>
                    {sortedConversations.length > 0 ? (
                      sortedConversations.map(([userId, messages]) => {
                        const otherUser = getOtherUser(userId);
                        const lastMessage = getLastMessage(messages);
                        const unreadCount = getUnreadCount(messages);

                        if (!otherUser) return null;

                        return (
                          <button
                            key={userId}
                            onClick={() => handleSelectUser(userId)}
                            className={`w-full flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors ${
                              selectedUserId === userId ? "bg-blue-50" : ""
                            }`}
                          >
                            <img
                              src={
                                otherUser.profileImage ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`
                              }
                              alt={otherUser.name}
                              className="h-12 w-12 rounded-full"
                            />
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">
                                  {otherUser.name}
                                </p>
                                {lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                              {lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {lastMessage.senderId === user.id && "You: "}
                                  {lastMessage.content}
                                </p>
                              )}
                              {unreadCount > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No conversations yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Search for users to start chatting
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
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
                      <p className="text-sm text-gray-500">
                        {selectedUser.department} • Year {selectedUser.year}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.length > 0 ? (
                      <>
                        {/* Group messages by date */}
                        {selectedConversation.map((message, index) => {
                          const showDate =
                            index === 0 ||
                            formatDate(message.createdAt) !==
                              formatDate(
                                selectedConversation[index - 1].createdAt
                              );
                          const isOwn = message.senderId === user.id;

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="text-center my-4">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`flex ${
                                  isOwn ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    isOwn
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-100 text-gray-900"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <div
                                    className={`flex items-center justify-end space-x-1 mt-1 ${
                                      isOwn ? "text-blue-100" : "text-gray-500"
                                    }`}
                                  >
                                    <span className="text-xs">
                                      {formatTime(message.createdAt)}
                                    </span>
                                    {isOwn && message.isRead && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Send a message to start the conversation
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      Select a conversation
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a chat from the list or search for users
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
