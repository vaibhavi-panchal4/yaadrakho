import React, { useState, useEffect } from "react";
import api from "../services/api";

function ScanPage() {
  const [image, setImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [subEvents, setSubEvents] = useState([]);
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("scan");
  const [suggestion, setSuggestion] = useState(null);

  // 🔥 Load events
  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  // 🔥 Load sub-events when event changes
  const handleEventChange = async (id) => {
    setEventId(id);
    setData([]);
    setSubEvents([]);

    if (!id) return;

    try {
      const res = await api.get(`/events/${id}`);
      setSubEvents(res.data.sub_events || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔄 Switch mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setData([]);
  };

  // 📸 Scan Upload
  const handleUpload = async () => {
    if (!eventId) return alert("Select event");
    if (!image) return alert("Select image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("event_id", eventId);

    try {
      const res = await api.post("/upload-image", formData);

      // 🔥 group by person
      const grouped = {};

      res.data.parsed_data.forEach((item) => {
        if (!grouped[item.name]) {
          grouped[item.name] = { name: item.name, entries: [] };
        }

        grouped[item.name].entries.push({
          sub_event_id: "",
          gift_type: "cash",
          amount: item.amount || "",
          item_name: "",
        });
      });

      setData(Object.values(grouped));
    } catch (err) {
      console.error(err);
      alert("Scan failed");
    }
  };

  // ➕ Add person
  const addPerson = () => {
    setData([...data, { name: "", entries: [] }]);
  };

  // ➕ Add entry (sub-event gift)
  const addEntry = (pIndex) => {
    const updated = [...data];
    updated[pIndex].entries.push({
      sub_event_id: "",
      gift_type: "cash",
      amount: "",
      item_name: "",
    });
    setData(updated);
  };

  // ❌ Remove entry
  const removeEntry = (pIndex, eIndex) => {
    const updated = [...data];
    updated[pIndex].entries.splice(eIndex, 1);
    setData(updated);
  };

  // 🤖 Smart suggestion
  const handleNameChange = async (pIndex, value) => {
    const updated = [...data];
    updated[pIndex].name = value;
    setData(updated);

    if (value.length > 2 && eventId) {
      try {
        const res = await api.get("/suggest-smart", {
          params: { name: value, event_id: eventId },
        });
        setSuggestion(res.data);
      } catch {
        setSuggestion(null);
      }
    }
  };

  // 💾 SAVE ALL
  const handleSave = async () => {
    if (!eventId) return alert("Select event");

    const flat = [];

    data.forEach((p) => {
      p.entries.forEach((e) => {
        flat.push({
          name: p.name,
          sub_event_id: e.sub_event_id ? Number(e.sub_event_id) : null, // ✅ FIX
          gift_type: e.gift_type,
          amount: e.gift_type === "cash" ? Number(e.amount) : null,
          item_name: e.gift_type === "gift" ? e.item_name : null,
        });
      });
    });

    console.log("SENDING:", flat); // 🔍 debug

    try {
      await api.post("/entries/save-bulk", {
        event_id: eventId,
        entries: flat,
      });

      alert("Saved successfully!");
      setData([]);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🎁 Add Gifts</h2>

      {/* MODE */}
      <div style={styles.modeSwitch}>
        <button
          style={mode === "scan" ? styles.activeBtn : styles.modeBtn}
          onClick={() => switchMode("scan")}
        >
          📸 Scan
        </button>
        <button
          style={mode === "manual" ? styles.activeBtn : styles.modeBtn}
          onClick={() => switchMode("manual")}
        >
          ✏️ Manual
        </button>
      </div>

      {/* EVENT */}
      <select
        style={styles.input}
        value={eventId}
        onChange={(e) => handleEventChange(e.target.value)}
      >
        <option value="">Select Event</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>

      {/* SCAN MODE */}
      {mode === "scan" && (
        <>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button style={styles.primaryBtn} onClick={handleUpload}>
            Scan Image
          </button>
        </>
      )}

      {/* MANUAL MODE */}
      {mode === "manual" && eventId && (
        <button style={styles.addBtn} onClick={addPerson}>
          ➕ Add Person
        </button>
      )}

      {/* DATA */}
      {data.map((person, pIndex) => (
        <div key={pIndex} style={styles.card}>
          <input
            placeholder="Person Name"
            value={person.name}
            onChange={(e) => handleNameChange(pIndex, e.target.value)}
            style={styles.input}
          />

          {suggestion && (
            <div style={styles.suggestionBox}>{suggestion.message}</div>
          )}

          {person.entries.map((entry, eIndex) => (
            <div key={eIndex} style={styles.row}>
              {/* SUB EVENT */}
              <select
                value={entry.sub_event_id}
                onChange={(e) => {
                  const updated = [...data];
                  updated[pIndex].entries[eIndex].sub_event_id = Number(
                    e.target.value,
                  ); // ✅ FIX
                  setData(updated);
                }}
              >
                <option value="">Sub Event</option>
                {subEvents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* TYPE */}
              <select
                value={entry.gift_type}
                onChange={(e) => {
                  const updated = [...data];
                  updated[pIndex].entries[eIndex].gift_type = e.target.value;
                  setData(updated);
                }}
              >
                <option value="cash">Cash</option>
                <option value="gift">Gift</option>
              </select>

              {/* VALUE */}
              {entry.gift_type === "cash" ? (
                <input
                  type="number"
                  placeholder="Amount"
                  value={entry.amount}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[pIndex].entries[eIndex].amount = Number(
                      e.target.value,
                    );
                    setData(updated);
                  }}
                />
              ) : (
                <input
                  placeholder="Gift Item"
                  value={entry.item_name}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[pIndex].entries[eIndex].item_name = e.target.value;
                    setData(updated);
                  }}
                />
              )}

              <button onClick={() => removeEntry(pIndex, eIndex)}>❌</button>
            </div>
          ))}

          <button onClick={() => addEntry(pIndex)}>
            ➕ Add Sub Event Gift
          </button>
        </div>
      ))}

      {/* SAVE */}
      {data.length > 0 && (
        <button style={styles.saveBtn} onClick={handleSave}>
          💾 Save All
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 420, margin: "40px auto" },
  input: { width: "100%", padding: 10, marginBottom: 10 },
  modeSwitch: { display: "flex", gap: 10 },
  modeBtn: { flex: 1, padding: 10, background: "#eee" },
  activeBtn: { flex: 1, padding: 10, background: "#000", color: "#fff" },
  primaryBtn: {
    width: "100%",
    padding: 10,
    background: "green",
    color: "#fff",
  },
  addBtn: { width: "100%", padding: 10, background: "#2196F3", color: "#fff" },
  saveBtn: { width: "100%", padding: 12, background: "#000", color: "#fff" },
  card: { background: "#f9f9f9", padding: 15, marginTop: 10 },
  row: { display: "flex", gap: 6, marginBottom: 8 },
  suggestionBox: {
    background: "#fff8e1",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
};

export default ScanPage;
