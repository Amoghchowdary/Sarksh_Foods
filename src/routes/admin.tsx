import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  Gauge,
  Inbox,
  LoaderCircle,
  LogOut,
  PackagePlus,
  RefreshCw,
  Save,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  adminApi,
  type AdminBootstrap,
  type AdminEnquiry,
  type AdminOrder,
  type AdminProduct,
  type AdminWebsite,
} from "@/lib/adminApi";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Tab = "overview" | "products" | "orders" | "enquiries" | "websites";
type Notice = { type: "success" | "error" | "info"; text: string } | null;

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentity = {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
  disableAutoSelect: () => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

const TOKEN_KEY = "sarksh-foods-admin-id-token";
const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [data, setData] = useState<AdminBootstrap | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(Boolean(token));
  const [notice, setNotice] = useState<Notice>(null);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setData(null);
    setNotice(null);
    window.google?.accounts?.id?.disableAutoSelect?.();
  }, []);

  const refresh = useCallback(async (activeToken = token, quiet = false) => {
    if (!activeToken) return;
    if (!quiet) setLoading(true);
    try {
      const next = await adminApi.bootstrap(activeToken);
      setData(next);
      if (!quiet) setNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Admin data could not be loaded.";
      if (/not authorized|invalid|expired|sign-in/i.test(message)) {
        signOut();
        setNotice({ type: "error", text: "Admin session expired. Sign in again with the authorized Google account." });
      } else {
        setNotice({ type: "error", text: message });
      }
    } finally {
      setLoading(false);
    }
  }, [signOut, token]);

  useEffect(() => {
    if (token) void refresh(token);
  }, [token, refresh]);

  const handleCredential = useCallback((credential: string) => {
    sessionStorage.setItem(TOKEN_KEY, credential);
    setToken(credential);
  }, []);

  if (!token) {
    return <AdminLogin onCredential={handleCredential} notice={notice} />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods" />
          <div><strong>SARKSH FOODS</strong><span>Admin</span></div>
        </div>
        <nav className="admin-nav" aria-label="Admin sections">
          <AdminNavButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<Gauge size={18} />} label="Overview" />
          <AdminNavButton active={tab === "products"} onClick={() => setTab("products")} icon={<Boxes size={18} />} label="Products" />
          <AdminNavButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList size={18} />} label="Orders" />
          <AdminNavButton active={tab === "enquiries"} onClick={() => setTab("enquiries")} icon={<Inbox size={18} />} label="Enquiries" />
          <AdminNavButton active={tab === "websites"} onClick={() => setTab("websites")} icon={<Activity size={18} />} label="Websites" />
        </nav>
        <div className="admin-sidebar-footer">
          <span>Authorized admin</span>
          <strong>{data?.admin.email || "amoghchowdaryamaraneni@gmail.com"}</strong>
          <button type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">SARKSH Foods · Production</span>
            <h1>{tabLabel(tab)}</h1>
          </div>
          <div className="admin-top-actions">
            {data?.resources.spreadsheetUrl ? <a href={data.resources.spreadsheetUrl} target="_blank" rel="noreferrer"><FileSpreadsheet size={16} /> Sheets</a> : null}
            {data?.resources.driveFolderUrl ? <a href={data.resources.driveFolderUrl} target="_blank" rel="noreferrer"><FolderOpen size={16} /> Drive</a> : null}
            <button type="button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} className={loading ? "admin-spin" : ""} /> Refresh</button>
          </div>
        </header>

        {notice ? <div className={`admin-notice admin-notice--${notice.type}`}>{notice.text}</div> : null}
        {loading && !data ? <AdminLoading /> : null}

        {data ? (
          <>
            {tab === "overview" ? <Overview data={data} /> : null}
            {tab === "products" ? <ProductsPanel data={data} token={token} refresh={refresh} setNotice={setNotice} /> : null}
            {tab === "orders" ? <OrdersPanel rows={data.orders} token={token} refresh={refresh} setNotice={setNotice} /> : null}
            {tab === "enquiries" ? <EnquiriesPanel rows={data.enquiries} token={token} refresh={refresh} setNotice={setNotice} /> : null}
            {tab === "websites" ? <WebsitesPanel rows={data.websites} token={token} refresh={refresh} setNotice={setNotice} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}

function AdminLogin({ onCredential, notice }: { onCredential: (credential: string) => void; notice: Notice }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(Boolean(window.google?.accounts?.id));
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-sarksh-google-identity="true"]');
    if (existing) {
      const poll = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          window.clearInterval(poll);
          setScriptReady(true);
        }
      }, 120);
      return () => window.clearInterval(poll);
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.sarkshGoogleIdentity = "true";
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptError("Google Sign-In could not be loaded. Check the network and OAuth configuration.");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google?.accounts?.id) return;
    const identity = window.google.accounts.id;
    identity.initialize({
      client_id: clientId,
      auto_select: false,
      callback: (response) => {
        if (response.credential) onCredential(response.credential);
      },
    });
    buttonRef.current.innerHTML = "";
    identity.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
      width: Math.min(320, buttonRef.current.clientWidth || 280),
    });
  }, [onCredential, scriptReady]);

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods" />
        <span className="admin-kicker">Production control</span>
        <h1>SARKSH Foods Admin</h1>
        <p>Products, orders, enquiries, website health, Google Sheets and Drive—one controlled workspace.</p>
        <div className="admin-login-trust"><ShieldCheck size={19} /><span>Access restricted to <strong>amoghchowdaryamaraneni@gmail.com</strong></span></div>
        {!clientId ? <div className="admin-notice admin-notice--error">Google OAuth Client ID is not configured. Set VITE_GOOGLE_CLIENT_ID before deploying the admin portal.</div> : null}
        {scriptError ? <div className="admin-notice admin-notice--error">{scriptError}</div> : null}
        {notice ? <div className={`admin-notice admin-notice--${notice.type}`}>{notice.text}</div> : null}
        {clientId ? <div className="admin-google-button" ref={buttonRef}>{scriptReady ? null : <span>Loading Google Sign-In…</span>}</div> : null}
        <a href="/" className="admin-back-link">Return to SARKSH Foods</a>
      </section>
    </main>
  );
}

function Overview({ data }: { data: AdminBootstrap }) {
  const cards = [
    ["Products", data.stats.activeProducts, `${data.stats.products} total`, Boxes],
    ["New orders", data.stats.newOrders, `${data.orders.length} loaded`, ClipboardList],
    ["New enquiries", data.stats.newEnquiries, `${data.enquiries.length} loaded`, Inbox],
    ["Websites online", data.stats.websitesOnline, `${data.stats.websites} monitored`, Activity],
  ] as const;
  return (
    <div className="admin-content-stack">
      <section className="admin-stat-grid">
        {cards.map(([label, value, detail, Icon]) => (
          <article className="admin-stat-card" key={label}><Icon size={20} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
        ))}
      </section>
      <section className="admin-two-column">
        <AdminPanel title="Recent orders" subtitle="Latest customer order requests">
          <CompactOrders rows={data.orders.slice(0, 5)} />
        </AdminPanel>
        <AdminPanel title="Website health" subtitle="Production properties being monitored">
          <div className="admin-health-list">
            {data.websites.map((site) => <WebsiteHealth key={site.id} site={site} />)}
            {!data.websites.length ? <AdminEmpty text="No websites configured." /> : null}
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}

function ProductsPanel({ data, token, refresh, setNotice }: { data: AdminBootstrap; token: string; refresh: (token?: string, quiet?: boolean) => Promise<void>; setNotice: (notice: Notice) => void }) {
  const emptyProduct = useMemo<Partial<AdminProduct>>(() => ({ status: "Draft", category: "Spices", featured: false, stockLabel: "Enquiries open" }), []);
  const [editing, setEditing] = useState<Partial<AdminProduct>>(emptyProduct);
  const [image, setImage] = useState<{ name: string; mimeType: string; base64: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onImage(file?: File) {
    if (!file) return setImage(null);
    if (file.size > 4_500_000) {
      setNotice({ type: "error", text: "Product image must be under 4.5 MB." });
      return;
    }
    const base64 = await fileToBase64(file);
    setImage({ name: file.name, mimeType: file.type, base64 });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveProduct(token, { ...editing, ...(image ? { image } : {}) });
      setNotice({ type: "success", text: "Product saved to Google Sheets and Drive." });
      setEditing(emptyProduct);
      setImage(null);
      await refresh(token, true);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Product could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content-stack">
      <AdminPanel title={editing.id ? "Edit product" : "Add product"} subtitle="Product master data is stored in Google Sheets; uploaded media is stored in Google Drive.">
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-grid">
            <AdminField label="Product name" value={editing.name || ""} onChange={(value) => setEditing((v) => ({ ...v, name: value }))} required />
            <AdminField label="Slug" value={editing.slug || ""} onChange={(value) => setEditing((v) => ({ ...v, slug: value }))} placeholder="chilli-powder" required />
            <AdminField label="Category" value={editing.category || ""} onChange={(value) => setEditing((v) => ({ ...v, category: value }))} required />
            <AdminField label="Pack size" value={editing.packSize || ""} onChange={(value) => setEditing((v) => ({ ...v, packSize: value }))} placeholder="1 kg" required />
            <label className="admin-field"><span>Status</span><select value={editing.status || "Draft"} onChange={(e) => setEditing((v) => ({ ...v, status: e.target.value }))}><option>Active</option><option>Draft</option><option>Archived</option></select></label>
            <AdminField label="Stock / order label" value={editing.stockLabel || ""} onChange={(value) => setEditing((v) => ({ ...v, stockLabel: value }))} />
          </div>
          <label className="admin-field"><span>Short description</span><textarea rows={3} value={editing.shortDescription || ""} onChange={(e) => setEditing((v) => ({ ...v, shortDescription: e.target.value }))} /></label>
          <div className="admin-form-grid admin-form-grid--media">
            <label className="admin-field"><span>Product image (JPG, PNG, WebP)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void onImage(e.target.files?.[0])} /></label>
            <label className="admin-check"><input type="checkbox" checked={Boolean(editing.featured)} onChange={(e) => setEditing((v) => ({ ...v, featured: e.target.checked }))} /><span>Featured product</span></label>
          </div>
          <div className="admin-form-actions">
            {editing.id ? <button type="button" className="admin-secondary" onClick={() => { setEditing(emptyProduct); setImage(null); }}>Cancel edit</button> : null}
            <button type="submit" className="admin-primary" disabled={saving}><Save size={16} /> {saving ? "Saving…" : "Save product"}</button>
          </div>
        </form>
      </AdminPanel>

      <section className="admin-card-grid">
        {data.products.map((product) => (
          <article className="admin-product-card" key={product.id}>
            <div className="admin-product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <PackagePlus size={28} />}</div>
            <div className="admin-product-copy"><span>{product.category} · {product.packSize}</span><h3>{product.name}</h3><p>{product.shortDescription}</p><div><StatusPill value={product.status} /><small>{product.stockLabel}</small></div></div>
            <button type="button" onClick={() => { setEditing(product); setImage(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
          </article>
        ))}
        {!data.products.length ? <AdminEmpty text="No products in the database." /> : null}
      </section>
    </div>
  );
}

function OrdersPanel({ rows, token, refresh, setNotice }: { rows: AdminOrder[]; token: string; refresh: (token?: string, quiet?: boolean) => Promise<void>; setNotice: (notice: Notice) => void }) {
  return <AdminPanel title="Order requests" subtitle="Customer and commercial product requirements recorded from the website."><ResponsiveTable headers={["Reference", "Customer", "Product", "Qty", "Buyer", "Contact", "Delivery", "Status"]}>{rows.map((row) => <tr key={row.reference}><td><strong>{row.reference}</strong><small>{formatDate(row.createdAt)}</small></td><td>{row.customer}</td><td>{row.productName}<small>{row.packSize}</small></td><td>{row.quantity}</td><td>{row.buyerType}</td><td>{row.phone}<small>{row.email || "—"}</small></td><td>{row.pincode}<small>{row.address}</small></td><td><StatusSelect value={row.status} options={["New", "Contacted", "Confirmed", "Closed", "Cancelled"]} onChange={async (status) => { try { await adminApi.updateOrderStatus(token, row.reference, status); await refresh(token, true); setNotice({ type: "success", text: `${row.reference} updated to ${status}.` }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Status update failed." }); } }} /></td></tr>)}</ResponsiveTable>{!rows.length ? <AdminEmpty text="No order requests yet." /> : null}</AdminPanel>;
}

function EnquiriesPanel({ rows, token, refresh, setNotice }: { rows: AdminEnquiry[]; token: string; refresh: (token?: string, quiet?: boolean) => Promise<void>; setNotice: (notice: Notice) => void }) {
  return <AdminPanel title="Enquiries" subtitle="Contact-form requirements and business conversations."><ResponsiveTable headers={["Reference", "Name", "Contact", "Type", "Requirement", "Status"]}>{rows.map((row) => <tr key={row.reference}><td><strong>{row.reference}</strong><small>{formatDate(row.createdAt)}</small></td><td>{row.name}</td><td>{row.phone}<small>{row.email || "—"}</small></td><td>{row.requirementType || "General"}</td><td className="admin-wide-cell">{row.requirementDetails}</td><td><StatusSelect value={row.status} options={["New", "Contacted", "Resolved", "Closed"]} onChange={async (status) => { try { await adminApi.updateEnquiryStatus(token, row.reference, status); await refresh(token, true); setNotice({ type: "success", text: `${row.reference} updated to ${status}.` }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Status update failed." }); } }} /></td></tr>)}</ResponsiveTable>{!rows.length ? <AdminEmpty text="No enquiries yet." /> : null}</AdminPanel>;
}

function WebsitesPanel({ rows, token, refresh, setNotice }: { rows: AdminWebsite[]; token: string; refresh: (token?: string, quiet?: boolean) => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [form, setForm] = useState<Partial<AdminWebsite>>({ environment: "Production" });
  const [busy, setBusy] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("save");
    try { await adminApi.saveWebsite(token, form as Record<string, unknown>); setNotice({ type: "success", text: "Website monitor saved." }); setForm({ environment: "Production" }); await refresh(token, true); }
    catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Website could not be saved." }); }
    finally { setBusy(""); }
  }

  async function check(id: string) {
    setBusy(id);
    try { await adminApi.checkWebsite(token, id); await refresh(token, true); setNotice({ type: "success", text: "Website health check completed." }); }
    catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Website check failed." }); }
    finally { setBusy(""); }
  }

  return (
    <div className="admin-content-stack">
      <AdminPanel title="Website monitor" subtitle="Track sarkshfoods.in and additional SARKSH properties from one place. Add each new monitored domain to the Apps Script URL allowlist before running health checks." action={<button type="button" className="admin-secondary" disabled={Boolean(busy)} onClick={async () => { setBusy("all"); try { await adminApi.checkAllWebsites(token); await refresh(token, true); setNotice({ type: "success", text: "All websites checked." }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Website checks failed." }); } finally { setBusy(""); } }}><RefreshCw size={15} className={busy === "all" ? "admin-spin" : ""} /> Check all</button>}>
        <div className="admin-website-grid">
          {rows.map((site) => <article className="admin-website-card" key={site.id}><div><StatusDot status={site.status} /><span>{site.environment}</span></div><h3>{site.name}</h3><a href={site.url} target="_blank" rel="noreferrer">{site.url}<ExternalLink size={14} /></a><dl><div><dt>Status</dt><dd>{site.status}</dd></div><div><dt>HTTP</dt><dd>{site.httpStatus ?? "—"}</dd></div><div><dt>Response</dt><dd>{site.responseMs == null ? "—" : `${site.responseMs} ms`}</dd></div><div><dt>Checked</dt><dd>{site.lastChecked ? formatDate(site.lastChecked) : "Not yet"}</dd></div></dl><div className="admin-card-actions"><button type="button" onClick={() => setForm(site)}>Edit</button><button type="button" disabled={busy === site.id} onClick={() => void check(site.id)}><RefreshCw size={14} className={busy === site.id ? "admin-spin" : ""} /> Check now</button></div></article>)}
        </div>
      </AdminPanel>
      <AdminPanel title={form.id ? "Edit website" : "Add website"} subtitle="Use an HTTPS URL. The production monitor checks availability and response time from Apps Script.">
        <form className="admin-form" onSubmit={save}><div className="admin-form-grid"><AdminField label="Website name" value={form.name || ""} onChange={(value) => setForm((v) => ({ ...v, name: value }))} required /><AdminField label="HTTPS URL" value={form.url || ""} onChange={(value) => setForm((v) => ({ ...v, url: value }))} placeholder="https://sarkshfoods.in" required /><AdminField label="Environment" value={form.environment || ""} onChange={(value) => setForm((v) => ({ ...v, environment: value }))} /><AdminField label="Notes" value={form.notes || ""} onChange={(value) => setForm((v) => ({ ...v, notes: value }))} /></div><div className="admin-form-actions">{form.id ? <button type="button" className="admin-secondary" onClick={() => setForm({ environment: "Production" })}>Cancel edit</button> : null}<button type="submit" className="admin-primary" disabled={busy === "save"}><Save size={16} /> {busy === "save" ? "Saving…" : "Save website"}</button></div></form>
      </AdminPanel>
    </div>
  );
}

function AdminNavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button type="button" className={active ? "is-active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>; }
function AdminPanel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) { return <section className="admin-panel"><header><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>{action}</header>{children}</section>; }
function AdminField({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) { return <label className="admin-field"><span>{label}{required ? " *" : ""}</span><input value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} /></label>; }
function ResponsiveTable({ headers, children }: { headers: string[]; children: React.ReactNode }) { return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function StatusSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => Promise<void> }) { const [busy, setBusy] = useState(false); return <select className="admin-status-select" value={value} disabled={busy} onChange={async (e) => { setBusy(true); await onChange(e.target.value); setBusy(false); }}>{options.map((item) => <option key={item}>{item}</option>)}</select>; }
function StatusPill({ value }: { value: string }) { return <span className={`admin-status-pill admin-status-pill--${value.toLowerCase().replace(/\s+/g, "-")}`}>{value}</span>; }
function StatusDot({ status }: { status: string }) { return <span className={`admin-status-dot admin-status-dot--${status.toLowerCase().replace(/\s+/g, "-")}`} aria-label={status} />; }
function WebsiteHealth({ site }: { site: AdminWebsite }) { return <div className="admin-health-row"><StatusDot status={site.status} /><div><strong>{site.name}</strong><span>{site.url}</span></div><div><strong>{site.status}</strong><span>{site.responseMs == null ? "Not checked" : `${site.responseMs} ms`}</span></div></div>; }
function CompactOrders({ rows }: { rows: AdminOrder[] }) { return <div className="admin-compact-list">{rows.map((row) => <div key={row.reference}><div><strong>{row.customer}</strong><span>{row.productName} · {row.quantity}</span></div><div><StatusPill value={row.status} /><small>{formatDate(row.createdAt)}</small></div></div>)}{!rows.length ? <AdminEmpty text="No order requests yet." /> : null}</div>; }
function AdminEmpty({ text }: { text: string }) { return <div className="admin-empty"><Store size={22} /><span>{text}</span></div>; }
function AdminLoading() { return <div className="admin-loading"><LoaderCircle size={24} className="admin-spin" /><span>Loading production data…</span></div>; }
function tabLabel(tab: Tab) { return ({ overview: "Overview", products: "Products", orders: "Orders", enquiries: "Enquiries", websites: "Websites" } as const)[tab]; }
function formatDate(value: string) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
function fileToBase64(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "").split(",")[1] || ""); reader.onerror = () => reject(new Error("Image could not be read.")); reader.readAsDataURL(file); }); }
