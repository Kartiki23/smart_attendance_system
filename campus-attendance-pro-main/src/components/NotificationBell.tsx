import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import socket from "@/services/socket";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Load from DB (initial load)
  const loadCount = async () => {
    try {
      const res = await api.get("/notification/notify");
      const unread = res.data.data.filter((n: any) => !n.isRead);
      setCount(unread.length);
    } catch (err) {
      console.error("Notification count error:", err);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    loadCount();
  }, []);

  // ✅ Register user in socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
    }
  }, [user]);

  // ✅ REAL-TIME LISTENER
  useEffect(() => {
    socket.on("newNotification", (data) => {
      console.log("🔔 New notification:", data);

      // Increase count instantly
      setCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => navigate("/notifications")}
    >
      <Bell className="w-6 h-6" />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}