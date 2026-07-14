import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const loadGoogleMaps = () => {
  if (window.google) return;
  const script = document.createElement("script");
  // Clean potential quotes around the environment variable value
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim().replace(/['"]/g, "");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

loadGoogleMaps();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
