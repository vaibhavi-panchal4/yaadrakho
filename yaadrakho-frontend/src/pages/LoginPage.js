import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 🔒 if already logged in → redirect
  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      return showToast("Enter email and password ⚠️", "error");
    }

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("Login successful 🎉", "success");
      navigate("/");
    } catch (err) {
      console.error(err);
      showToast("Login failed ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">🔐 Welcome Back</h2>
          <p className="text-gray-500 text-sm">
            Login to continue tracking gifts 🎁
          </p>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {showPass ? "🙈" : "👁"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* LINKS */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>
            Forgot password?{" "}
            <span
              className="text-blue-600 font-semibold cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Reset here
            </span>
          </p>

          <p>
            New user?{" "}
            <span
              className="text-blue-600 font-semibold cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Create account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
