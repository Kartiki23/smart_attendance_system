import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import api from "@/services/api";
import { Button } from "@/components/ui/button";

export default function StudentAttendance() {

  const [session, setSession] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await api.get("/attendance/active-session");
      if (res.data.success) {
        setSession(res.data.session);
      } else {
        setMessage(res.data.message);
      }
    } catch {
      setMessage("Error loading session");
    }
  };

  // ✅ Button Attendance
  const markAttendance = async () => {
    try {
      const res = await api.post("/attendance/scan", {
        sessionToken: session.sessionToken
      });

      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  // ✅ QR Scan Attendance
  const handleScan = async (data: any) => {
    if (!data) return;

    try {
      const parsed = JSON.parse(data.text);

      const res = await api.post("/attendance/scan", {
        sessionToken: parsed.sessionToken
      });

      setMessage(res.data.message);
      setShowScanner(false);

    } catch (err: any) {
      setMessage(err.response?.data?.message || "Scan failed");
    }
  };

  return (

    <div className="p-6 text-center">

      <h2 className="text-xl font-bold mb-4">
        Attendance System
      </h2>

      {session ? (
        <>
          <p className="mb-2">{session.subject}</p>
          <p className="mb-4">{session.class}</p>

          {/* 📱 BUTTON */}
          <Button onClick={markAttendance} className="mb-3">
            Mark Attendance
          </Button>

          {/* 📷 QR OPTION */}
          <Button
            variant="outline"
            onClick={() => setShowScanner(!showScanner)}
          >
            Scan QR Instead
          </Button>

          {showScanner && (
            <div className="mt-4">
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result) => {
                  if (result) handleScan(result);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <p>{message}</p>
      )}

      {message && (
        <p className="mt-4 text-blue-600">
          {message}
        </p>
      )}

    </div>
  );
}