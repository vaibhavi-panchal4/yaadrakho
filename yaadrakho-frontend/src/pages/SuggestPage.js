import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

function SuggestPage() {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 🔥 fetch events
  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // =====================================================
  // 🎯 GET SUGGESTION (NAME SEARCH)
  // =====================================================
  const getSuggestion = async () => {
    if (!name || !eventId) {
      showToast("Enter name + select event");
      return;
    }

    setLoading(true);
    setResult(null);
    setConfirmData(null);

    try {
      const res = await api.get("/suggest-smart", {
        params: {
          name,
          event_id: eventId,
        },
      });

      if (res.data.type === "confirm") {
        setConfirmData(res.data);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to get suggestion");
    }

    setLoading(false);
  };

  // =====================================================
  // 🎯 SELECT PERSON FROM SUGGESTIONS
  // =====================================================
  const handleSelectPerson = async (personId, personName) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await api.get("/suggest-smart", {
        params: {
          person_id: personId, // ✅ correct param
          event_id: eventId,
        },
      });

      setName(personName); // ✅ update input
      setConfirmData(null); // ✅ hide options
      setResult(res.data); // ✅ show result
    } catch (err) {
      console.error(err);
      showToast("Error fetching suggestion");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold">🧠 Smart Suggestion</h2>
          <p className="text-gray-500 text-sm">
            Know what to gift based on past data
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white p-5 rounded-2xl shadow-md space-y-3">
          <input
            placeholder="Enter person name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />

          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="">Select Event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={getSuggestion}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            {loading ? "Thinking..." : "Get Suggestion"}
          </button>
        </div>

        {/* CONFIRM MULTIPLE PEOPLE */}
        {confirmData && confirmData.options && (
          <div className="bg-yellow-100 p-4 rounded-2xl">
            <p className="font-medium mb-2">🤔 Who do you mean?</p>

            <div className="space-y-2">
              {confirmData.options.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPerson(p.id, p.name)}
                  className="w-full p-2 bg-white rounded-lg border"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <button
              className="mt-3 w-full bg-red-500 text-white p-2 rounded-lg"
              onClick={() => {
                setConfirmData(null);
                setResult({ message: "No past data found 😅" });
              }}
            >
              ❌ None of these
            </button>
          </div>
        )}

        {/* RESULT */}
        {result && result.type === "smart" && (
          <div className="bg-white p-5 rounded-2xl shadow-md space-y-4">
            {/* SUMMARY */}
            <div>
              <h3 className="text-lg font-semibold">{result.summary.event}</h3>
              <p className="text-sm text-gray-500">{result.summary.time}</p>
            </div>

            {/* GIVEN */}
            <div>
              <h4 className="font-medium mb-2">🎁 They gave</h4>
              <div className="space-y-2">
                {result.given.map((g, i) => (
                  <div
                    key={i}
                    className="flex justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <span>{g.sub_event}</span>
                    <span>
                      ₹{g.cash}
                      {g.gifts.length > 0 && ` + 🎁 ${g.gifts.join(", ")}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED */}
            <div>
              <h4 className="font-medium mb-2">💡 You should give</h4>
              <div className="space-y-2">
                {result.suggested.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between bg-green-50 p-2 rounded-lg"
                  >
                    <span>{s.sub_event}</span>
                    <span>
                      ₹{s.cash}
                      {s.gifts && " + 🎁 similar gift"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOTAL */}
            <div className="text-center pt-3 border-t">
              <h3 className="text-xl font-bold">💰 ₹{result.final.cash}</h3>
              <p className="text-sm text-gray-500">{result.final.note}</p>
            </div>
          </div>
        )}

        {/* SIMPLE MESSAGE */}
        {result && !result.type && (
          <div className="bg-white p-4 rounded-xl text-center text-gray-600">
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuggestPage;
