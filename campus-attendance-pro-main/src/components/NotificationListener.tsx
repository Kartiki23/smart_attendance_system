import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://smartattendancesystem-2-esaj.onrender.com", {
  transports: ["websocket"]
});

export default function NotificationListener() {

  useEffect(() => {
    console.log("🔔 Connecting to WebSocket...");

    socket.on("connect", () => {
      console.log("✅ WebSocket connected:", socket.id);
    });

    socket.on("lectureReminder", (data) => {
      console.log("📢 Reminder received:", data);
      alert(data.message);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    return () => {
      socket.off("lectureReminder");
    };
  }, []);

  return null;
}