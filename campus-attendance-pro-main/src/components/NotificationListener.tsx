import { useEffect } from "react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

export default function NotificationListener() {

  useEffect(() => {

    socket.on("newNotification", (data) => {

      console.log("🔔 Notification:", data.message);

      // 🔊 Play sound
      if (data.playSound) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      }

    });

  }, []);

  return null;
}