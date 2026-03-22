import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import api from "@/services/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ ADDED

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      await api.post("/otp/send-otp", { email });

      alert("OTP sent to your email");

      // ✅ REDIRECT TO OTP SCREEN
      navigate("/reset-password-otp", { state: { email } });

    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-2xl border">
          
          {/* Header */}
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">
              Forgot Password
            </CardTitle>

            <CardDescription>
              Enter your email to receive a verification OTP
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-5">

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Button */}
            <Button
              onClick={handleSendOTP}
              disabled={loading || !email}
              className="w-full h-11 flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send OTP"}
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Footer */}
            <p className="text-xs text-center text-muted-foreground">
              We will send a secure OTP to your registered email
            </p>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}