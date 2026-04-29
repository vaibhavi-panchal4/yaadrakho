import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return setMessage("Enter email");

    try {
      setLoading(true);
      setMessage("");

      await api.post("/send-otp", { email });

      setStep(2);
      setMessage("OTP sent to your email 📩");
    } catch {
      setMessage("Failed to send OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !password) {
      return setMessage("Fill all fields");
    }

    try {
      setLoading(true);
      setMessage("");

      await api.post("/verify-otp", {
        email,
        otp,
        password,
      });

      setMessage("Password reset successful ✅");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      setMessage("Invalid OTP or error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">🔐 Reset Password</h2>
          <p className="text-gray-500 text-sm">Step {step} of 2</p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:scale-105 active:scale-95"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full p-3 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPass ? "🙈" : "👁"}
              </span>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`w-full p-3 rounded-xl text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:scale-105 active:scale-95"
              }`}
            >
              {loading ? "Verifying..." : "Reset Password"}
            </button>
          </>
        )}

        {/* MESSAGE */}
        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("❌") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* BACK */}
        <p className="text-center text-sm text-gray-600">
          Back to{" "}
          <span
            className="text-blue-600 font-semibold cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
