import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type Plugin } from "vite";

type Next = (error?: unknown) => void;

type Enquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  source: "website-local-verification";
};

type Booking = {
  id: string;
  createdAt: string;
  productSlug: string;
  productName: string;
  packSize: string;
  name: string;
  phone: string;
  email: string;
  buyerType: string;
  quantity: number;
  pincode: string;
  address: string;
  notes: string;
  status: "recorded-local-verification";
};

const enquiriesFile = resolve(process.cwd(), "data", "enquiries.json");
const bookingsFile = resolve(process.cwd(), "data", "bookings.json");

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_000_000) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

async function readRecords<T>(file: string): Promise<T[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

async function writeRecords<T>(file: string, records: T[]) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  await rename(temporary, file);
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function integer(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}

function localCommerceApi(): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: Next) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (url.pathname === "/api/health" && req.method === "GET") {
      sendJson(res, 200, { ok: true, service: "sarksh-foods-local-commerce-preview", timestamp: new Date().toISOString() });
      return;
    }

    try {
      if (url.pathname === "/api/enquiries") {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, message: "Method not allowed" });
          return;
        }
        const body = await readJsonBody(req);
        const name = text(body.name, 80);
        const email = text(body.email, 120);
        const phone = text(body.phone, 24);
        const interest = text(body.interest, 120);
        const message = text(body.message, 1200);
        if (name.length < 2 || phone.length < 7 || message.length < 4) {
          sendJson(res, 400, { ok: false, message: "Name, contact number, and requirement details are required." });
          return;
        }
        const record: Enquiry = {
          id: `SF-E-${Date.now().toString(36).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          name, email, phone, interest, message,
          source: "website-local-verification",
        };
        const records = await readRecords<Enquiry>(enquiriesFile);
        records.push(record);
        await writeRecords(enquiriesFile, records.slice(-2000));
        sendJson(res, 201, { ok: true, id: record.id });
        return;
      }

      if (url.pathname === "/api/bookings") {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, message: "Method not allowed" });
          return;
        }
        const body = await readJsonBody(req);
        const productSlug = text(body.productSlug, 100);
        const productName = text(body.productName, 120);
        const packSize = text(body.packSize, 40);
        const name = text(body.name, 80);
        const phone = text(body.phone, 24);
        const email = text(body.email, 120);
        const buyerType = text(body.buyerType, 60);
        const quantity = integer(body.quantity);
        const pincode = text(body.pincode, 12);
        const address = text(body.address, 500);
        const notes = text(body.notes, 600);
        if (!productSlug || !productName || name.length < 2 || phone.length < 8 || !buyerType || quantity < 1 || pincode.length < 4 || address.length < 6) {
          sendJson(res, 400, { ok: false, message: "Please complete the required booking details." });
          return;
        }
        const record: Booking = {
          id: `SF-B-${Date.now().toString(36).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          productSlug, productName, packSize, name, phone, email, buyerType, quantity, pincode, address, notes,
          status: "recorded-local-verification",
        };
        const records = await readRecords<Booking>(bookingsFile);
        records.push(record);
        await writeRecords(bookingsFile, records.slice(-5000));
        sendJson(res, 201, { ok: true, id: record.id });
        return;
      }

      next();
    } catch (error) {
      console.error("Local SARKSH Foods API error:", error);
      sendJson(res, 500, { ok: false, message: "The local server could not save this request." });
    }
  };

  return {
    name: "sarksh-foods-local-commerce-api",
    configureServer(server) { server.middlewares.use(handle); },
    configurePreviewServer(server) { server.middlewares.use(handle); },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    localCommerceApi(),
  ],
  resolve: { tsconfigPaths: true },
});
