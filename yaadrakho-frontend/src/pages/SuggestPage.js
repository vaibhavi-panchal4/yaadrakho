import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function SuggestPage() {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      alert("Enter name + select event");
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
      alert("Failed to get suggestion");
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
      alert("Error fetching suggestion");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>🧠 Smart Gift Suggestion</h2>

      {/* INPUT */}
      <input
        placeholder="Enter person name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />

      {/* EVENT SELECT */}
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        style={styles.input}
      >
        <option value="">Select Event</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>

      {/* BUTTON */}
      <button style={styles.btn} onClick={getSuggestion}>
        {loading ? "Thinking..." : "Get Suggestion"}
      </button>

      {/* 🔥 MULTIPLE OPTIONS */}
      {confirmData && confirmData.options && (
        <div style={styles.confirmBox}>
          <p>🤔 Who do you mean?</p>

          {confirmData.options.map((p) => (
            <button
              key={p.id}
              style={styles.optionBtn}
              onClick={() => handleSelectPerson(p.id, p.name)}
            >
              {p.name}
            </button>
          ))}

          <button
            style={styles.noBtn}
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
      {result && (
        <div style={styles.result}>
          <p>{result.message || "No suggestion found 😅"}</p>
        </div>
      )}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ⬅ Back
      </button>
    </div>
  );
}

// =====================================================
// 🎨 STYLES (CLEAN UI)
// =====================================================
const styles = {
  container: {
    maxWidth: 420,
    margin: "60px auto",
    textAlign: "center",
    fontFamily: "Arial",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  btn: {
    width: "100%",
    padding: 12,
    background: "#000",
    color: "white",
    borderRadius: 8,
    marginBottom: 15,
    cursor: "pointer",
  },

  confirmBox: {
    marginTop: 15,
    padding: 15,
    background: "#fff3cd",
    borderRadius: 12,
  },

  optionBtn: {
    display: "block",
    width: "100%",
    padding: 10,
    marginTop: 8,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
  },

  noBtn: {
    marginTop: 10,
    padding: 10,
    width: "100%",
    background: "#ff4d4d",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  result: {
    marginTop: 20,
    background: "#f1f1f1",
    padding: 15,
    borderRadius: 12,
    fontSize: 15,
  },

  backBtn: {
    marginTop: 15,
    padding: 10,
    width: "100%",
    background: "#ccc",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};

export default SuggestPage;
