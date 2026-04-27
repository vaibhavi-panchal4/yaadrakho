import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Card>
        <h1>YaadRakho 📒</h1>

        <button style={styles.button} onClick={() => navigate("/create-event")}>
          ➕ Create Event
        </button>

        <button style={styles.button} onClick={() => navigate("/scan")}>
          📸 Scan Gift List
        </button>

        <button
          style={styles.button}
          onClick={() => navigate("/suggest-smart")}
        >
          🧠 Smart Suggest
        </button>

        <button style={styles.button} onClick={() => navigate("/history")}>
          📜 View History
        </button>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "100px auto",
    fontFamily: "Arial",
  },
  button: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "#000",
    color: "white",
    fontSize: 15,
  },
};

export default HomePage;
