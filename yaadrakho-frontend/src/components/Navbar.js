import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

function Navbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showToast("Logged out successfully 👋", "success");
    navigate("/login");
  };

  return (
    <div className="w-full bg-black text-white px-4 py-3 flex items-center justify-between shadow-md">
      {/* LEFT - APP NAME */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span className="text-xl">📒</span>
        <span className="font-semibold text-lg hidden sm:block">YaadRakho</span>
      </div>

      {/* RIGHT - USER + LOGOUT */}
      <div className="flex items-center gap-3">
        {/* USER */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <span className="text-sm hidden sm:block">
            👋 Welcome, {user?.name || "there"}
          </span>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="bg-white text-black px-3 py-1.5 rounded-xl text-sm font-semibold hover:scale-105 active:scale-95 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
