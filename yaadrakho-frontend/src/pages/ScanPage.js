import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

function ScanPage() {
  const [image, setImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [subEvents, setSubEvents] = useState([]);
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("scan");

  // 🎤 voice states
  const [listeningIndex, setListeningIndex] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("");

  const { showToast } = useToast();

  // 🔥 Load events
  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  // 🔥 Load sub-events
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

  // 🎤 Voice Input
  const startVoiceInput = (pIndex) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListeningIndex(pIndex);
    setVoiceStatus("🎤 Listening...");

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      console.log("Voice:", text);

      setVoiceStatus("⚙️ Processing...");
      processVoice(text, pIndex);
    };

    recognition.onend = () => {
      setListeningIndex(null);
      setVoiceStatus("");
    };

    recognition.onerror = (err) => {
      console.error(err);
      setVoiceStatus("❌ Error");
      setListeningIndex(null);
    };

    recognition.start();
  };

  // 🧠 Convert words to numbers
  const wordToNumber = (word) => {
    const map = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      hundred: 100,
      thousand: 1000,
    };
    return map[word.toLowerCase()] || null;
  };

  // 🧠 Process voice
  const processVoice = (text, pIndex) => {
    const words = text.toLowerCase().split(" ");
    const updated = [...data];

    const skipWords = ["gave", "given", "diya"];

    let entries = [];

    let currentName = "";
    let currentGift = [];

    const flush = (type = "gift", amount = "") => {
      if (!currentName) return;

      entries.push({
        name: currentName,
        gift_type: type,
        amount,
        item_name: type === "gift" ? currentGift.join(" ") : "",
      });

      currentName = "";
      currentGift = [];
    };

    for (let i = 0; i < words.length; i++) {
      const w = words[i];

      if (skipWords.includes(w)) continue;

      const next = words[i + 1];
      const isNextNumber = next && (!isNaN(next) || wordToNumber(next));

      const isNumber = !isNaN(w) || wordToNumber(w);

      // 💰 CASH
      if (isNumber) {
        flush("cash", !isNaN(w) ? w : wordToNumber(w));
        continue;
      }

      // 👤 NAME DETECTION (KEY FIX)
      if (!currentName) {
        currentName = w;
        continue;
      }

      // 🔥 NEW PERSON DETECT (if next is number)
      if (isNextNumber) {
        flush("gift");
        currentName = w;
        continue;
      }

      // 🎁 otherwise gift
      currentGift.push(w);
    }

    // leftover
    if (currentName) {
      flush("gift");
    }

    // APPLY
    entries.forEach((entry, index) => {
      if (index === 0) {
        updated[pIndex].name = entry.name;

        updated[pIndex].entries.push({
          sub_event_id: "",
          gift_type: entry.gift_type,
          amount: entry.amount,
          item_name: entry.item_name,
        });
      } else {
        updated.push({
          name: entry.name,
          entries: [
            {
              sub_event_id: "",
              gift_type: entry.gift_type,
              amount: entry.amount,
              item_name: entry.item_name,
            },
          ],
          suggestion: null,
        });
      }
    });

    setData(updated);
  };

  // 🔄 Mode switch
  const switchMode = (newMode) => {
    setMode(newMode);
    setData([]);
  };

  // 📸 Scan Upload
  const handleUpload = async () => {
    if (!eventId) return showToast("Select event");
    if (!image) return showToast("Select image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("event_id", eventId);

    try {
      const res = await api.post("/upload-image", formData);

      const grouped = {};

      res.data.parsed_data.forEach((item) => {
        if (!grouped[item.name]) {
          grouped[item.name] = {
            name: item.name,
            entries: [],
            suggestion: null,
          };
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
      showToast("Scan failed");
    }
  };

  // ➕ Add person
  const addPerson = () => {
    setData([...data, { name: "", entries: [], suggestion: null }]);
  };

  // ➕ Add entry
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

        updated[pIndex].suggestion = res.data;
        setData([...updated]);
      } catch {
        updated[pIndex].suggestion = null;
        setData([...updated]);
      }
    }
  };

  // 💾 Save
  const handleSave = async () => {
    if (!eventId) return showToast("Select event");

    const flat = [];

    for (const p of data) {
      if (!p.name) {
        showToast("Name missing");
        return;
      }

      for (const e of p.entries) {
        if (e.gift_type === "cash" && !e.amount) {
          showToast("Amount missing");
          return;
        }

        flat.push({
          name: p.name,
          sub_event_id: e.sub_event_id ? Number(e.sub_event_id) : null,
          gift_type: e.gift_type,
          amount: e.gift_type === "cash" ? Number(e.amount) : null,
          item_name: e.gift_type === "gift" ? e.item_name : null,
        });
      }
    }

    try {
      await api.post("/entries/save-bulk", {
        event_id: eventId,
        entries: flat,
      });

      showToast("Saved successfully!");
      setData([]);
    } catch (err) {
      console.error(err);
      showToast("Save failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">🎁 Add Gifts</h2>

      {/* MODE */}
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 p-2 rounded-lg ${
            mode === "scan" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => switchMode("scan")}
        >
          📸 Scan
        </button>
        <button
          className={`flex-1 p-2 rounded-lg ${
            mode === "manual" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => switchMode("manual")}
        >
          ✏️ Manual
        </button>
      </div>

      {/* EVENT */}
      <select
        className="w-full p-3 border rounded-xl mb-4"
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

      {/* SCAN */}
      {mode === "scan" && (
        <div className="space-y-3 mb-4">
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button
            className="w-full bg-green-600 text-white p-3 rounded-xl"
            onClick={handleUpload}
          >
            Scan Image
          </button>
        </div>
      )}

      {/* MANUAL */}
      {mode === "manual" && eventId && (
        <button
          className="w-full bg-blue-500 text-white p-3 rounded-xl mb-4"
          onClick={addPerson}
        >
          ➕ Add Person
        </button>
      )}

      {/* DATA */}
      <div className="space-y-4">
        {data.map((person, pIndex) => (
          <div
            key={pIndex}
            className="bg-white shadow-md rounded-2xl p-4 space-y-3"
          >
            {/* NAME + VOICE */}
            <div className="flex flex-col md:flex-row gap-2">
              <input
                placeholder="Person Name"
                value={person.name}
                onChange={(e) => handleNameChange(pIndex, e.target.value)}
                className="flex-1 p-3 border rounded-xl"
              />

              <button
                onClick={() => startVoiceInput(pIndex)}
                className={`px-4 py-2 rounded-xl text-white ${
                  listeningIndex === pIndex ? "bg-red-500" : "bg-green-600"
                }`}
              >
                {listeningIndex === pIndex ? "Listening..." : "🎤 Speak"}
              </button>
            </div>

            {listeningIndex === pIndex && (
              <p className="text-sm text-gray-500">{voiceStatus}</p>
            )}

            {/* SUGGESTION */}
            {person.suggestion && (
              <div className="bg-yellow-100 p-2 rounded-lg text-sm">
                {person.suggestion.message}
              </div>
            )}

            {/* ENTRIES */}
            {person.entries.map((entry, eIndex) => (
              <div
                key={eIndex}
                className="flex flex-col md:flex-row gap-2 items-center"
              >
                <select
                  className="p-2 border rounded-lg w-full md:w-auto"
                  value={entry.sub_event_id}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[pIndex].entries[eIndex].sub_event_id = Number(
                      e.target.value,
                    );
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

                <select
                  className="p-2 border rounded-lg w-full md:w-auto"
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

                {entry.gift_type === "cash" ? (
                  <input
                    type="number"
                    placeholder="Amount"
                    value={entry.amount}
                    className="p-2 border rounded-lg w-full"
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
                    className="p-2 border rounded-lg w-full"
                    onChange={(e) => {
                      const updated = [...data];
                      updated[pIndex].entries[eIndex].item_name =
                        e.target.value;
                      setData(updated);
                    }}
                  />
                )}

                <button
                  onClick={() => removeEntry(pIndex, eIndex)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}

            <button
              onClick={() => addEntry(pIndex)}
              className="text-blue-600 text-sm"
            >
              ➕ Add Sub Event Gift
            </button>
          </div>
        ))}
      </div>

      {/* SAVE */}
      {data.length > 0 && (
        <button
          className="w-full mt-6 bg-black text-white p-3 rounded-xl"
          onClick={handleSave}
        >
          💾 Save All
        </button>
      )}
    </div>
  );
}

export default ScanPage;
