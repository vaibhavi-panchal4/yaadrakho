import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleNavigate = (path, message) => {
    showToast(message, "success");
    navigate(path);
  };

  const handleComingSoon = () => {
    showToast("Feature coming soon 🚀");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Track gifts, remember people, return smartly 🎁
          </p>
        </div>

        {/* MAIN ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() =>
              handleNavigate("/create-event", "Opening event creator 🎉")
            }
            className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">➕ Create Event</h3>
            <p className="text-sm text-gray-500">
              Start a new function and track gifts
            </p>
          </div>

          <div
            onClick={() => handleNavigate("/scan", "Opening scanner 📸")}
            className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">📸 Scan Gift List</h3>
            <p className="text-sm text-gray-500">
              Upload image and auto-extract gifts
            </p>
          </div>

          <div
            onClick={() =>
              handleNavigate("/suggest-smart", "Getting smart suggestions 🧠")
            }
            className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">🧠 Smart Suggest</h3>
            <p className="text-sm text-gray-500">
              Know what to gift back intelligently
            </p>
          </div>

          <div
            onClick={() => handleNavigate("/history", "Opening history 📜")}
            className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">📜 View History</h3>
            <p className="text-sm text-gray-500">
              See all past events and entries
            </p>
          </div>
        </div>

        {/* FUTURE SECTION */}
        <div
          onClick={handleComingSoon}
          className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold mb-2">🚀 Coming Soon</h3>
          <p className="text-sm text-gray-500">
            AI insights, top contributors, smart return suggestions...
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
