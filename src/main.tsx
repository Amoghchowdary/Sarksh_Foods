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
import "./theme-v90-public.css";
import "./home-v90-fmcg.css";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Application root element was not found");
}

// Production SEO pages contain a crawl-first HTML shell inside #app. Search engines
// can parse that static content immediately, while real browsers replace it with
// the interactive React application as soon as JavaScript starts.
if (rootElement.querySelector("[data-seo-prerender='true']")) {
  rootElement.replaceChildren();
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

