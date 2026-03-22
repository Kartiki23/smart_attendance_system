import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, KeyRound } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordOTP() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.otp || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/otp/reset-password-otp", form);

      alert("✅ Password reset successful");

      navigate("/login");

    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background px-4">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
      >

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-primary mb-2">
          Reset Password
        </h2>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email, OTP and new password
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground">Email</label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <Mail className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="email"
              placeholder="Enter email"
              className="w-full py-2 outline-none bg-transparent"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* OTP */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground">OTP</label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <KeyRound className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              placeholder="Enter OTP"
              className="w-full py-2 outline-none bg-transparent"
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground">
            New Password
          </label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <Lock className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full py-2 outline-none bg-transparent"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* Back to login */}
        <p
          onClick={() => navigate("/login")}
          className="text-center text-sm text-primary mt-4 cursor-pointer hover:underline"
        >
          Back to Login
        </p>

      </motion.div>
    </div>
  );
}