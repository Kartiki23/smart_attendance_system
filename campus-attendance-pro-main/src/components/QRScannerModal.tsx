import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, CheckCircle, AlertCircle, Camera, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState("");
    const [locationGranted, setLocationGranted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset states when modal opens
            setIsScanning(false);
            setScanResult(null);
            setMessage("");
            setLocationGranted(false);
        }
    }, [isOpen]);

    const requestLocation = async () => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            setLocationGranted(true);
            setMessage(`Location verified: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
            return true;
        } catch (error) {
            setMessage("Location access denied. Please enable location services.");
            return false;
        }
    };

    const handleStartScan = async () => {
        // First verify location
        const hasLocation = await requestLocation();

        if (!hasLocation) {
            setScanResult("error");
            return;
        }

        setIsScanning(true);
        setMessage("Processing attendance...");

        // Simulate QR code scanning delay slightly for UX
        setTimeout(async () => {
            try {
                // In a real app, we would scan the QR code content here.
                // For this web simplified version, we assume the user is present if they passed location check
                // and clicked "Scan". The backend validates the schedule logic.

                await import("@/services/api").then(async ({ default: api }) => {
                    const userStr = localStorage.getItem('user');
                    const user = userStr ? JSON.parse(userStr) : null;

                    const response = await api.post('/attendance/scan', {
                        studentId: user?.id,
                        subjectId: "scanned_subject_123", // Simulated scan data
                        facultyId: "scanned_faculty_456" // Simulated scan data
                    });

                    if (response.data.success) {
                        setScanResult("success");
                        setMessage(response.data.message || "Attendance marked successfully! ✓");

                        // Auto close after 2 seconds
                        setTimeout(() => {
                            onClose();
                            // Optional: Refresh dashboard (could use a callback context)
                            window.location.reload();
                        }, 2000);
                    }
                });
            } catch (error: any) {
                console.error(error);
                setScanResult("error");
                setMessage(error.response?.data?.message || "Attendance failed. No active lecture found.");
            } finally {
                setIsScanning(false);
            }
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <Card className="w-full max-w-md bg-white shadow-2xl">
                            <CardHeader className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-4 top-4"
                                    onClick={onClose}
                                >
                                    <X className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <QrCode className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-primary">QR Code Scanner</CardTitle>
                                        <CardDescription>Scan to mark your attendance</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Scanner Area */}
                                <div className="relative">
                                    <div className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-colors ${isScanning
                                        ? "border-blue-500 bg-blue-50"
                                        : scanResult === "success"
                                            ? "border-green-500 bg-green-50"
                                            : scanResult === "error"
                                                ? "border-red-500 bg-red-50"
                                                : "border-dashed border-gray-300 bg-gray-50"
                                        }`}>
                                        {!isScanning && !scanResult && (
                                            <div className="text-center p-6">
                                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-sm text-muted-foreground">
                                                    Position QR code within the frame
                                                </p>
                                            </div>
                                        )}

                                        {isScanning && (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="w-24 h-24 border-4 border-blue-500 rounded-lg"
                                            />
                                        )}

                                        {scanResult === "success" && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-center"
                                            >
                                                <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
                                                <p className="text-lg font-semibold text-green-700">Success!</p>
                                            </motion.div>
                                        )}

                                        {scanResult === "error" && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-center"
                                            >
                                                <AlertCircle className="w-24 h-24 text-red-600 mx-auto mb-4" />
                                                <p className="text-lg font-semibold text-red-700">Failed</p>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Scanning corner markers */}
                                    {!scanResult && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                                        </div>
                                    )}
                                </div>

                                {/* Status Message */}
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-lg ${scanResult === "success"
                                            ? "bg-green-100 text-green-800"
                                            : scanResult === "error"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                    >
                                        <p className="text-sm text-center font-medium">{message}</p>
                                    </motion.div>
                                )}

                                {/* Location Status */}
                                {locationGranted && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>Location verified</span>
                                    </div>
                                )}

                                {/* Instructions */}
                                {!isScanning && !scanResult && (
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">1</span>
                                            Faculty will display a QR code on screen
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">2</span>
                                            Click "Start Scanner" and allow location access
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">3</span>
                                            Point your camera at the QR code
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {!isScanning && !scanResult && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={onClose}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleStartScan}
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                            >
                                                <QrCode className="w-4 h-4 mr-2" />
                                                Start Scanner
                                            </Button>
                                        </>
                                    )}

                                    {scanResult === "error" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={onClose}
                                                className="flex-1"
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setScanResult(null);
                                                    setMessage("");
                                                    handleStartScan();
                                                }}
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                            >
                                                Try Again
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Note */}
                                <p className="text-xs text-center text-muted-foreground">
                                    Note: QR codes expire after 5 minutes of lecture start
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
