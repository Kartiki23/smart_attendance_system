import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Camera, MapPin, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { markAttendance, validateQRCodeData, type QRCodeData, type Location } from "@/lib/attendanceService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScanner({ open, onOpenChange }: QRScannerProps) {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request location permission on mount
  useEffect(() => {
    if (open) {
      requestLocation();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [open]);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError("Location access denied. Please enable GPS for accurate attendance.");
        console.error("Location error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleQRScan = async (qrData: string) => {
    if (!user) {
      toast.error("Please log in to mark attendance");
      return;
    }

    try {
      // Parse QR code data
      const qrCodeData: QRCodeData = JSON.parse(qrData);

      // Validate QR code format
      if (!validateQRCodeData(qrCodeData)) {
        setResult({
          success: false,
          message: "Invalid QR code format",
        });
        return;
      }

      setProcessing(true);
      setResult(null);

      // Mark attendance
      const attendanceResult = await markAttendance(
        user.uid,
        qrCodeData,
        location || undefined
      );

      setResult(attendanceResult);

      if (attendanceResult.success) {
        toast.success(attendanceResult.message);
        setTimeout(() => {
          onOpenChange(false);
          setResult(null);
          stopCamera();
        }, 2000);
      } else {
        toast.error(attendanceResult.message);
      }
    } catch (error: any) {
      console.error("Error processing QR code:", error);
      setResult({
        success: false,
        message: error.message || "Failed to process QR code",
      });
      toast.error("Failed to process QR code");
    } finally {
      setProcessing(false);
    }
  };

  const handleManualInput = () => {
    const qrCode = prompt("Enter QR code data (JSON format):");
    if (qrCode) {
      handleQRScan(qrCode);
    }
  };

  const handleClose = () => {
    stopCamera();
    setResult(null);
    setProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Scan the QR code displayed by your faculty to mark attendance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            {location ? (
              <>
                <MapPin className="w-4 h-4 text-faculty" />
                <span className="text-sm text-muted-foreground">Location: Ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">
                  {locationError || "Requesting location..."}
                </span>
              </>
            )}
          </div>

          {/* Camera View */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            {scanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm opacity-75">Camera not started</p>
              </div>
            )}

            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-faculty rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-faculty" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-faculty" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-faculty" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-faculty" />
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {processing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Processing...</p>
                </div>
              </div>
            )}

            {/* Result Overlay */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    result.success ? "bg-faculty/20" : "bg-destructive/20"
                  )}
                >
                  <div className="text-center text-white">
                    {result.success ? (
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-faculty" />
                    ) : (
                      <XCircle className="w-16 h-16 mx-auto mb-2 text-destructive" />
                    )}
                    <p className="text-sm font-medium">{result.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!scanning ? (
              <Button
                variant="student"
                className="flex-1"
                onClick={startCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleManualInput}
              disabled={processing}
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Point camera at the QR code</p>
            <p>• Ensure good lighting</p>
            <p>• Keep device steady</p>
            <p>• Location must be enabled</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

