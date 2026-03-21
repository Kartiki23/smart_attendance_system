import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SplashScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        // Navigate to home page after 3 seconds
        const timer = setTimeout(() => {
            navigate("/");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] flex items-center justify-center p-4">
            <div className="text-center">
                {/* College Emblem */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 mx-auto bg-white rounded-full p-4 shadow-xl">
                        <img
                            src="/college-logo.png"
                            alt="Government Polytechnic Awasari Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </motion.div>

                {/* Institution Name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-6"
                >
                    <h1 className="text-white font-display text-2xl md:text-3xl font-bold mb-2">
                        Government Polytechnic, Awasari (Kh.)
                    </h1>
                    <p className="text-blue-100 font-medium text-sm md:text-base">
                        Computer Engineering Department
                    </p>
                </motion.div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-24 h-0.5 bg-white/50 mx-auto mb-6"
                />

                {/* App Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="mb-8"
                >
                    <h2 className="text-white font-display text-xl md:text-2xl font-semibold mb-2">
                        College Attendance Management System
                    </h2>
                    <p className="text-blue-100 text-xs md:text-sm">
                        Final Year Diploma Project 2025-26
                    </p>
                </motion.div>

                {/* Loading Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex justify-center"
                >
                    <div className="flex space-x-2">
                        <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                        />
                        <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                        />
                        <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
