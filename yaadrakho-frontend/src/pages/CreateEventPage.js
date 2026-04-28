import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [subEvents, setSubEvents] = useState([""]);
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
    if (!name || !date) return alert("Fill all fields");

    try {
      await api.post("/events", {
        name,
        date,
        sub_events: subEvents.filter((s) => s.trim() !== ""),
      });

      alert("Event created!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Event</h2>

      <input
        placeholder="Event Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={styles.input}
      />

      <h4>Sub Events (Optional)</h4>

      {subEvents.map((sub, i) => (
        <div key={i} style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Sub Event (Haldi, Sangeet...)"
            value={sub}
            onChange={(e) => handleSubChange(i, e.target.value)}
            style={styles.input}
          />

          <button onClick={() => removeSubEvent(i)}>❌</button>
        </div>
      ))}

      <button onClick={addSubEvent}>➕ Add Sub Event</button>

      <button style={styles.btn} onClick={handleSubmit}>
        Create Event
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "50px auto",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "green",
    color: "white",
    borderRadius: 8,
  },
};

export default CreateEventPage;
