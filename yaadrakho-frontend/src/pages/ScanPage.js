import React, { useState, useEffect } from "react";
import api from "../services/api";

function ScanPage() {
  const [image, setImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("scan");
  const [suggestion, setSuggestion] = useState(null);

  // 🔥 Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEvents();
  }, []);

  // 🔥 Switch mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setData(
      newMode === "manual"
        ? [{ name: "", gift_type: "cash", amount: "", item_name: "" }]
        : [],
    );
  };

  // 🔥 Upload image
  const handleUpload = async () => {
    if (!eventId) return alert("Select event");
    if (!image) return alert("Select image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("event_id", eventId);

    try {
      const res = await api.post("/upload-image", formData);

      const parsed = res.data.parsed_data.map((item) => ({
        ...item,
        gift_type: "cash",
        item_name: "",
      }));

      setData(parsed);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // 🔥 Handle input change
  const handleChange = async (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;

    // reset opposite field
    if (field === "gift_type") {
      if (value === "cash") {
        updated[index].gift_item = "";
      } else {
        updated[index].amount = "";
      }
    }

    setData(updated);

    // 🔥 SMART SUGGESTION CALL
    if (field === "name" && value.length > 2 && eventId) {
      try {
        const res = await api.get("/suggest-smart", {
          params: {
            name: value,
            event_id: eventId,
          },
        });

        setSuggestion(res.data);
      } catch (err) {
        setSuggestion(null);
      }
    }
  };

  // 🔥 Add row
  const addRow = () => {
    setData([
      ...data,
      { name: "", gift_type: "cash", amount: "", item_name: "" },
    ]);
  };

  // 🔥 Remove row
  const removeRow = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  // 🔥 Save entries
  const handleSave = async () => {
    if (!eventId) return alert("Select event");
    if (data.length === 0) return alert("No entries");

    try {
      await api.post("/entries/save-bulk", {
        event_id: eventId,
        entries: data,
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

      {/* MODE SWITCH */}
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

      {/* EVENT SELECT */}
      <select
        style={styles.input}
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
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
          <input
            type="file"
            style={styles.fileInput}
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button style={styles.primaryBtn} onClick={handleUpload}>
            Scan Image
          </button>
        </>
      )}

      {/* MANUAL MODE */}
      {mode === "manual" && data.length === 0 && (
        <button style={styles.primaryBtn} onClick={addRow}>
          ➕ Start Adding
        </button>
      )}

      {/* EDIT SECTION */}
      {data.length > 0 && (
        <div style={styles.card}>
          <h3>Edit Entries</h3>

          {suggestion && (
            <div style={styles.suggestionBox}>
              {suggestion.cash && (
                <>
                  💰 Suggested Cash: ₹ {suggestion.cash.suggested} <br />
                  Last: ₹ {suggestion.cash.last} <br />
                </>
              )}

              {suggestion.gift && (
                <>
                  🎁 Last Gift: {suggestion.gift.item} <br />
                  👉 Suggest similar or higher value gift
                </>
              )}
            </div>
          )}

          {data.map((item, index) => (
            <div key={index} style={styles.row}>
              {/* NAME */}
              <input
                placeholder="Name"
                value={item.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                style={styles.input}
              />

              {/* TYPE */}
              <select
                value={item.gift_type}
                onChange={(e) =>
                  handleChange(index, "gift_type", e.target.value)
                }
                style={styles.typeSelect}
              >
                <option value="cash">Cash</option>
                <option value="gift">Gift</option>
              </select>

              {/* CONDITIONAL */}
              {item.gift_type === "cash" ? (
                <input
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    handleChange(index, "amount", e.target.value)
                  }
                  style={styles.input}
                />
              ) : (
                <input
                  placeholder="Gift Item"
                  value={item.item_name}
                  onChange={(e) =>
                    handleChange(index, "item_name", e.target.value)
                  }
                  style={styles.input}
                />
              )}

              <button style={styles.deleteBtn} onClick={() => removeRow(index)}>
                ❌
              </button>
            </div>
          ))}

          <button style={styles.addBtn} onClick={addRow}>
            ➕ Add Row
          </button>

          <button style={styles.saveBtn} onClick={handleSave}>
            💾 Save All
          </button>
        </div>
      )}
    </div>
  );
}

// 🎨 CLEAN STYLES (fixes dropdown issue)
const styles = {
  suggestionBox: {
    background: "#fff8e1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  container: {
    maxWidth: 420,
    margin: "40px auto",
    fontFamily: "Arial",
  },
  modeSwitch: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },
  modeBtn: {
    flex: 1,
    padding: 10,
    background: "#eee",
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  activeBtn: {
    flex: 1,
    padding: 10,
    background: "#000",
    color: "white",
    borderRadius: 8,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  typeSelect: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  fileInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    width: "100%",
    padding: 10,
    background: "#4CAF50",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  card: {
    marginTop: 15,
    padding: 15,
    background: "#f9f9f9",
    borderRadius: 10,
  },
  row: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  deleteBtn: {
    background: "red",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "5px 8px",
    cursor: "pointer",
  },
  addBtn: {
    width: "100%",
    padding: 10,
    background: "#2196F3",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  saveBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#000",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  backBtn: {
    marginBottom: 15,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#ddd",
    cursor: "pointer",
  },
};

export default ScanPage;
