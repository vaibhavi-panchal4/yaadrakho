import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !password_confirmation) {
      return showToast("Please fill all fields ⚠️", "error");
    }

    if (password !== password_confirmation) {
      return showToast("Passwords do not match ❌", "error");
    }

    try {
      setLoading(true);

      const res = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("Account created successfully 🎉", "success");

      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error(err);
      showToast("Register failed ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">📝 Create Account</h2>
          <p className="text-gray-500 text-sm">
            Start tracking your gifts smartly 🎁
          </p>
        </div>

        {/* INPUTS */}
        <input
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Confirm Password"
          value={password_confirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full p-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
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

export default RegisterPage;
