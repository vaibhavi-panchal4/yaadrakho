import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { LoaderButton, Card, Input } from "../components/ui";
import { showToast } from "../components/toast";

function CreateEventPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !date) {
      return showToast("Fill all fields");
    }

    try {
      setLoading(true);

      await api.post("/events", {
        name: name,
        date: date,
      });

      showToast("Event created 🎉");
      navigate("/");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      console.log("DATA:", err.response?.data);

      alert(JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card>
        <h2>Create Event</h2>

        <Input
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <LoaderButton
          style={styles.button}
          loading={loading}
          onClick={handleCreate}
        >
          Create Event
        </LoaderButton>

        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ⬅ Back
        </button>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "80px auto",
    fontFamily: "Arial",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 8,
    marginTop: 10,
  },
  backBtn: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "#eee",
    border: "none",
    borderRadius: 8,
  },
};

export default CreateEventPage;
