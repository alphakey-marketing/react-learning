import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MonetizationProvider } from "./context/MonetizationContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MonetizationProvider>
      <App />
    </MonetizationProvider>
  </React.StrictMode>
);