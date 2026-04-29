import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

function HistoryPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  //const [editingEntryId, setEditingEntryId] = useState(null);
  //const [editingEventId, setEditingEventId] = useState(null);

  const [editData, setEditData] = useState({});
  const [eventEditData, setEventEditData] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/events-with-entries");
    setEvents(res.data);
  };

  const filterEntries = (entries) => {
    if (!search.trim()) return entries;
    return entries.filter((e) =>
      e.person?.name?.toLowerCase().includes(search.toLowerCase()),
    );
  };

  const getCashTotal = (entries) =>
    entries
      .filter((e) => e.gift_type === "cash")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

  const getGiftCount = (entries) =>
    entries.filter((e) => e.gift_type === "gift").length;

  const groupBySubEvent = (entries) => {
    const grouped = {};
    entries.forEach((e) => {
      const key = e.sub_event?.name || "Main Event";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return grouped;
  };

  // ENTRY EDIT
  const startEdit = (entry) => {
    //setEditingEntryId(entry.id);
    setEditData({
      name: entry.person?.name || "",
      amount: entry.amount || "",
      item_name: entry.item_name || "",
      gift_type: entry.gift_type,
    });
  };

  /*const saveEdit = async (entry) => {
    await api.put(`/entries/${entry.id}`, {
      gift_type: editData.gift_type,
      amount: editData.gift_type === "cash" ? editData.amount : null,
      item_name: editData.gift_type === "gift" ? editData.item_name : null,
      name: editData.name,
      sub_event_id: entry.sub_event_id || null,
    });

    setEditingEntryId(null);
    fetchData();
    showToast("Entry updated ✨", "success");
  }; */

  //const cancelEdit = () => setEditingEntryId(null);

  const deleteEntry = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/entries/${deleteId}`);
      showToast("Entry deleted 🗑️", "success");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete ❌", "error");
    } finally {
      setDeleteId(null);
    }
  };

  // EVENT EDIT
  const startEventEdit = (event) => {
    setEditingEventId(event.id);
    setEventEditData(event.title);
  };

  const saveEventEdit = async (event) => {
    await api.put(`/events/${event.id}`, {
      name: eventEditData,
      date: event.event_date,
    });

    setEditingEventId(null);
    fetchData();
    showToast("Event updated ✨", "success");
  };

  const cancelEventEdit = () => setEditingEventId(null);

  // 🔥 UPDATED EVENT DELETE
  const deleteEvent = (id) => {
    setDeleteEventId(id);
  };

  const confirmEventDelete = async () => {
    try {
      await api.delete(`/events/${deleteEventId}`);
      fetchData();
      showToast("Event deleted 🗑️", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete event ❌", "error");
    } finally {
      setDeleteEventId(null);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "yaadrakho.csv");
      document.body.appendChild(link);
      link.click();

      showToast("Exported successfully 📁", "success");
    } catch {
      showToast("Export failed ❌", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">📜 History</h2>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              placeholder="Search person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border rounded-xl"
            />

            <button
              onClick={handleExport}
              className="bg-black text-white px-4 rounded-xl"
            >
              Export
            </button>
          </div>
        </div>

        {/* EVENTS */}
        {events.map((event) => {
          const filtered = filterEntries(event.entries);
          if (!filtered.length) return null;

          const grouped = groupBySubEvent(filtered);

          return (
            <div
              key={event.id}
              className="bg-white p-5 rounded-2xl shadow-md space-y-3"
            >
              <div className="flex justify-between items-center">
                {editingEventId === event.id ? (
                  <div className="flex gap-2 w-full">
                    <input
                      value={eventEditData}
                      onChange={(e) => setEventEditData(e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button onClick={() => saveEventEdit(event)}>💾</button>
                    <button onClick={cancelEventEdit}>❌</button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => startEventEdit(event)}>✏️</button>
                      <button onClick={() => deleteEvent(event.id)}>🗑</button>
                    </div>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-500">{event.event_date}</p>

              {Object.entries(grouped).map(([subEvent, entries]) => (
                <div key={subEvent} className="mt-3">
                  <div className="flex justify-between bg-gray-100 p-2 rounded-lg font-medium">
                    <span>{subEvent}</span>
                    <span>₹ {getCashTotal(entries)}</span>
                  </div>

                  <div className="divide-y">
                    {entries.map((entry) => {
                      //const isEditing = editingEntryId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          className="flex flex-col md:flex-row md:items-center gap-2 py-2"
                        >
                          <span className="flex-1">{entry.person?.name}</span>

                          {entry.gift_type === "cash" ? (
                            <span className="font-semibold text-green-600">
                              ₹ {entry.amount}
                            </span>
                          ) : (
                            <span className="text-gray-600">
                              🎁 {entry.item_name}
                            </span>
                          )}

                          <div className="flex gap-2">
                            <button onClick={() => startEdit(entry)}>✏️</button>
                            <button onClick={() => deleteEntry(entry.id)}>
                              ❌
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t font-semibold text-sm">
                💰 ₹ {getCashTotal(filtered)} | 🎁 {getGiftCount(filtered)}
              </div>
            </div>
          );
        })}

        {/* ENTRY DELETE MODAL */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-[300px] text-center space-y-4">
              <h3 className="text-lg font-semibold">Delete Entry?</h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 p-2 rounded-xl bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 p-2 rounded-xl bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EVENT DELETE MODAL */}
        {deleteEventId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-[300px] text-center space-y-4">
              <h3 className="text-lg font-semibold">Delete Event?</h3>
              <p className="text-sm text-gray-500">
                All entries inside this event will also be removed ⚠️
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteEventId(null)}
                  className="flex-1 p-2 rounded-xl bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmEventDelete}
                  className="flex-1 p-2 rounded-xl bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
