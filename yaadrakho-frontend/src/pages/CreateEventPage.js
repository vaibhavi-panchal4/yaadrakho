import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/toast";

function CreateEventPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [subEvents, setSubEvents] = useState([""]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubChange = (i, value) => {
    const updated = [...subEvents];
    updated[i] = value;
    setSubEvents(updated);
  };

  const addSubEvent = () => {
    setSubEvents([...subEvents, ""]);
  };

  const removeSubEvent = (i) => {
    setSubEvents(subEvents.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!name || !date) return showToast("Fill all fields");

    try {
      setLoading(true);

      await api.post("/events", {
        name,
        date,
        sub_events: subEvents.filter((s) => s.trim() !== ""),
      });

      showToast("Event created!", "success");
      navigate("/");
    } catch (err) {
      console.error(err);
      showToast("Error creating event", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6 space-y-4">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">🎉 Create Event</h2>
          <p className="text-gray-500 text-sm">
            Organize your gifting events smartly
          </p>
        </div>

        {/* EVENT NAME */}
        <input
          placeholder="Event Name (e.g. Riya Wedding)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* SUB EVENTS */}
        <div>
          <h4 className="font-semibold mb-2">Sub Events (Optional)</h4>

          <div className="space-y-2">
            {subEvents.map((sub, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Haldi, Sangeet..."
                  value={sub}
                  onChange={(e) => handleSubChange(i, e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                />

                <button
                  onClick={() => removeSubEvent(i)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <button onClick={addSubEvent} className="mt-2 text-blue-600 text-sm">
            ➕ Add Sub Event
          </button>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}

export default CreateEventPage;
