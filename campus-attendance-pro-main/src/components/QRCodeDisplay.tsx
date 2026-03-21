import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  sessionId: string;
  expiresIn: number; // seconds
  onRefresh: () => void;
  role?: "faculty";
}

export function QRCodeDisplay({ sessionId, expiresIn, onRefresh }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(expiresIn);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresIn]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / expiresIn) * 100;

  return (
    <motion.div
      className="bg-card rounded-2xl p-8 border border-border text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3 className="font-display font-semibold text-lg mb-6">Session QR Code</h3>

      {/* QR Code placeholder - in production, use a QR library */}
      <div className="relative mx-auto w-56 h-56 bg-white rounded-2xl p-4 shadow-lg mb-6">
        <div className="w-full h-full bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-xl flex items-center justify-center">
          {/* Simulated QR pattern */}
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${
                  Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Timer overlay */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card px-4 py-1 rounded-full border border-border shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-faculty" />
            <span>
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-faculty"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Session ID: <span className="font-mono font-medium text-foreground">{sessionId}</span>
      </p>

      <Button variant="faculty" onClick={onRefresh} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Generate New Code
      </Button>
    </motion.div>
  );
}
