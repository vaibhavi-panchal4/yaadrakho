import React, { useEffect, useState } from "react";
import api from "../services/api";

function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/events-with-entries");
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const filterEntries = (entries) => {
    if (!search.trim()) return entries;

    return entries.filter((e) =>
      e.person?.name?.toLowerCase().includes(search.toLowerCase().trim()),
    );
  };

  const getCashTotal = (entries) => {
    return entries
      .filter((e) => e.gift_type === "cash")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const getGiftCount = (entries) => {
    return entries.filter((e) => e.gift_type === "gift").length;
  };

  // 🔥 highlight search text
  const highlight = (text) => {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} style={{ background: "#ffe082" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  let hasResults = false;

  return (
    <div style={styles.container}>
      <h2>📜 History</h2>

      {/* SEARCH */}
      <input
        placeholder="Search person..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {events.map((event) => {
        const filtered = filterEntries(event.entries);

        if (filtered.length === 0) return null;

        hasResults = true;

        return (
          <div key={event.id} style={styles.card}>
            <h3>{event.title}</h3>
            <p style={styles.date}>{event.event_date}</p>

            {/* LIST */}
            {filtered.map((entry, i) => (
              <div key={i} style={styles.row}>
                <span>{highlight(entry.person?.name || "")}</span>

                {entry.gift_type === "cash" ? (
                  <span style={styles.cash}>₹ {entry.amount}</span>
                ) : (
                  <span style={styles.gift}>
                    🎁 {entry.item_name || "Gift"}
                  </span>
                )}
              </div>
            ))}

            {/* TOTALS */}
            <div style={styles.summary}>
              <div>💰 Total Cash: ₹ {getCashTotal(filtered)}</div>
              <div>🎁 Gifts: {getGiftCount(filtered)}</div>
            </div>
          </div>
        );
      })}

      {/* 🔥 NO RESULT UI */}
      {!hasResults && <div style={styles.noResult}>No results found 😕</div>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "30px auto",
    fontFamily: "Arial",
  },
  search: {
    width: "100%",
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  cash: {
    fontWeight: "bold",
  },
  gift: {
    color: "#555",
  },
  summary: {
    marginTop: 10,
    fontWeight: "bold",
  },
  noResult: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },
};

export default HistoryPage;
