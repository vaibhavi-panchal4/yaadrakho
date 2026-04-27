import React from "react";

export const LoaderButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    style={{
      ...props.style,
      opacity: loading ? 0.7 : 1,
      cursor: loading ? "not-allowed" : "pointer",
    }}
    disabled={loading}
  >
    {loading ? "⏳ Please wait..." : children}
  </button>
);

export const Card = ({ children }) => (
  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    }}
  >
    {children}
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      padding: 12,
      borderRadius: 8,
      border: "1px solid #ddd",
      marginBottom: 12,
      fontSize: 14,
    }}
  />
);
