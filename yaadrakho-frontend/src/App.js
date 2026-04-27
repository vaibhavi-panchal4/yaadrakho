import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ScanPage from "./pages/ScanPage";
import SuggestPage from "./pages/SuggestPage";
import HistoryPage from "./pages/HistoryPage";
import CreateEventPage from "./pages/CreateEventPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/suggest-smart" element={<SuggestPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
