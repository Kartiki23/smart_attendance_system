import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CollegeHeader } from "@/components/CollegeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function GenerateQR() {

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [nextLecture, setNextLecture] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/attendance/generate-qr",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // ❌ No active lecture
      if (!res.data.success) {

        setQrImage(null);

        if (res.data.nextLecture) {
          setNextLecture(res.data.nextLecture);
        } else {
          alert(res.data.message);
        }

        return;
      }

      // ✅ Active lecture
      setQrImage(res.data.qrImage);
      setSubject(res.data.subject);
      setClassName(res.data.class);
      setStartTime(res.data.startTime);
      setEndTime(res.data.endTime);
      setNextLecture(null);

      const expiry = new Date(res.data.expiresAt).getTime();
      const seconds = Math.floor((expiry - Date.now()) / 1000);

      setTimeLeft(seconds);
      setExpired(false);

    } catch (error: any) {

      alert(error?.response?.data?.message || "Error");

    } finally {

      setLoading(false);

    }
  };

  // ⏳ Timer
  useEffect(() => {

    if (!timeLeft) return;

    const timer = setInterval(() => {

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft]);

  return (

    <div className="min-h-screen bg-background">

      <CollegeHeader />

      <div className="container mx-auto px-4 py-8 max-w-lg">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          <Card>

            <CardHeader>
              <CardTitle className="text-center text-primary">
                Generate Attendance QR
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-center">

              <Button onClick={generateQR} disabled={loading}>
                {loading ? "Generating..." : "Generate QR"}
              </Button>

              {/* ✅ QR */}
              {qrImage && (
                <>
                  <h2 className="text-lg font-bold">{subject}</h2>
                  <p>Class: {className}</p>
                  <p>{startTime} - {endTime}</p>

                  {!expired ? (
                    <p className="text-green-600">
                      ⏳ {timeLeft}s left
                    </p>
                  ) : (
                    <p className="text-red-600">
                      QR Expired
                    </p>
                  )}

                  <img src={qrImage} className="mx-auto w-60" />

                  {expired && (
                    <Button onClick={generateQR}>
                      Regenerate QR
                    </Button>
                  )}
                </>
              )}

              {/* 📅 NEXT LECTURE */}
              {nextLecture && (
                <div className="mt-4 p-3 border rounded bg-yellow-50">
                  <p className="font-semibold">Next Lecture</p>
                  <p>{nextLecture.subject}</p>
                  <p>{nextLecture.class}</p>
                  <p>{nextLecture.startTime} - {nextLecture.endTime}</p>
                </div>
              )}

            </CardContent>

          </Card>

        </motion.div>

      </div>

    </div>
  );
}