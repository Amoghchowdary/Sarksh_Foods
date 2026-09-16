import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css";
import "./commercial-v7.css";
import "./commercial-v71-maroon.css";
import "./commercial-v72-logo-tiles.css";
import "./commercial-v73-contact-cards.css";
import "./commercial-v74-spice-marquee.css";
import "./commercial-v75-contact-trust.css";
import "./commercial-v76-form-clarity.css";
import "./commercial-v77-clean-contact.css";
import "./admin-v82.css";
import "./customer-v84.css";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Application root element was not found");
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}

