import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Clock, RefreshCw, MapPin, Users, StopCircle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SessionQRCodeProps {
  sessionId: string;
  subjectName: string;
  className: string;
  expiresAt: Date;
  onRefresh: () => void;
  onEndSession: () => void;
  studentsMarked?: number;
  totalStudents?: number;
  qrCode?: string; // Actual QR code string
}

export function SessionQRCode({
  sessionId,
  subjectName,
  className: classNameProp,
  expiresAt,
  onRefresh,
  onEndSession,
  studentsMarked = 0,
  totalStudents = 0,
  qrCode,
}: SessionQRCodeProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time left
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    return diff;
  }, [expiresAt]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    setIsExpired(false);

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = Math.floor((expiresAt.getTime() - new Date().getTime() + timeLeft * 1000) / 1000);
  const progress = totalSeconds > 0 ? (timeLeft / 300) * 100 : 0; // Assuming 5 min validity

  // QR code data - contains session info for scanning
  // Include the actual QR code string from session data
  const qrData = JSON.stringify({
    sessionId,
    qrCode: qrCode || sessionId, // Use provided QR code or fallback to sessionId
    expiresAt: expiresAt.toISOString(),
    type: "attendance",
  });

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border border-border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Live Session</h3>
          <p className="text-sm text-muted-foreground">{subjectName} • {classNameProp}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-faculty rounded-full animate-pulse" />
          <span className="text-sm font-medium text-faculty">Active</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="relative mx-auto w-64 h-64 bg-white rounded-2xl p-4 shadow-lg mb-6">
        {isExpired ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <Clock className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">QR Code Expired</p>
            <Button variant="faculty" size="sm" onClick={onRefresh} className="mt-3">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New
            </Button>
          </div>
        ) : (
          <QRCodeSVG
            value={qrData}
            size={224}
            level="H"
            includeMargin={false}
            className="w-full h-full"
          />
        )}

        {/* Timer overlay */}
        {!isExpired && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className={cn("w-4 h-4", timeLeft < 60 ? "text-destructive" : "text-faculty")} />
              <span className={cn(
                "text-sm font-mono font-bold",
                timeLeft < 60 ? "text-destructive" : "text-foreground"
              )}>
                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!isExpired && (
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
          <motion.div
            className={cn(
              "h-full rounded-full",
              timeLeft < 60 ? "bg-destructive" : "bg-gradient-faculty"
            )}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-faculty-muted rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-faculty" />
            <span className="text-2xl font-display font-bold text-faculty">{studentsMarked}</span>
          </div>
          <p className="text-xs text-muted-foreground">Students Marked</p>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-display font-bold">{totalStudents}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total Students</p>
        </div>
      </div>

      {/* Session ID */}
      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground">Session ID</p>
        <p className="font-mono text-sm font-medium">{sessionId.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onRefresh}
          disabled={!isExpired && timeLeft > 60}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh QR
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={onEndSession}
        >
          <StopCircle className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>
    </motion.div>
  );
}
