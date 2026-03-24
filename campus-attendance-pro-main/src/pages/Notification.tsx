import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import api from "@/services/api";
import { CollegeHeader } from "@/components/CollegeHeader";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

interface Notification {
  _id?: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt: string;
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notification/notify");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // ✅ REGISTER USER FOR SOCKET
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user?._id) {
      socket.emit("register", user._id);
    }

    // ✅ LISTEN REAL-TIME NOTIFICATION
    socket.on("newNotification", (data) => {

      console.log("🔔 Live Notification:", data.message);

      // 🔊 SOUND
      if (data.playSound) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      }

      // ✅ ADD TO UI (REAL-TIME)
      const newNotification: Notification = {
        message: data.message,
        createdAt: data.time || new Date().toISOString(),
        isRead: false,
        type: "lecture"
      };

      setNotifications((prev) => [newNotification, ...prev]);

    });

    return () => {
      socket.off("newNotification");
    };

  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((n, index) => (
            <motion.div
              key={n._id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 mb-3 rounded border ${
                n.isRead ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {!n.isRead && n._id && (
                  <button
                    onClick={() => markAsRead(n._id!)}
                    className="text-green-600"
                  >
                    <CheckCircle2 />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}