import React from "react";

// 🔘 BUTTON
export const LoaderButton = ({
  loading,
  children,
  className = "",
  ...props
}) => (
  <button
    {...props}
    disabled={loading}
    className={`w-full p-3 rounded-xl font-semibold text-white transition 
      ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:scale-105 active:scale-95"}
      ${className}`}
  >
    {loading ? "⏳ Please wait..." : children}
  </button>
);

// 📦 CARD
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-md ${className}`}>
    {children}
  </div>
);

// ✏️ INPUT
export const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${className}`}
  />
);
