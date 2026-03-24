import { useEffect } from "react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

export default function NotificationListener() {

  useEffect(() => {

    // ✅ GET USER ID FROM LOCAL STORAGE / TOKEN
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user?._id) {
      socket.emit("register", user._id); // 🔥 VERY IMPORTANT
    }

    socket.on("newNotification", (data) => {
      console.log("🔔 Notification:", data.message);

      if (data.playSound) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      }
    });

    return () => {
      socket.off("newNotification");
    };

  }, []);

  return null;
}