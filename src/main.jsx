import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import process from "process";
import React from "react";
window.process = process;

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
);
