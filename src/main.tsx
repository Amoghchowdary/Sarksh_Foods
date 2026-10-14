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
import "./commercial-v10-product-hero.css";
import "./commercial-v10-responsive.css";
import "./commercial-v10-5-polish.css";
import "./commercial-v11-quality.css";
import "./commercial-v11-1-scene.css";
import "./commercial-v11-2-reference.css";
import "./responsive-v14-14.css";

import "./responsive-v14-4-two-column.css";

import "./responsive-v14-4-mobile-background.css";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Application root element was not found");
}

document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    const isSupportedZone = Boolean(
      target.closest(".customer-product-media") ||
      target.closest(".product-detail-media") ||
      target.closest(".catalog-hero-media") ||
      target.closest(".catalog-pack") ||
      target.closest(".enterprise-pack") ||
      target.closest(".pack-display") ||
      target.closest(".product-focus-media") ||
      target.closest(".product-story-media") ||
      target.closest(".home-mobile-media")
    );

    if (!isSupportedZone) return;
    if (target.dataset.sarkshFallback === "1") return;

    target.dataset.sarkshFallback = "1";
    target.src = "/assets/chilli-pack-front.webp";
  },
  true,
);

rootElement.replaceChildren();
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
