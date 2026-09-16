import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  History,
  Home,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  customerApi,
  type CustomerAddress,
  type CustomerBootstrap,
  type CustomerOrder,
  type CustomerProduct,
} from "@/lib/customerApi";

export const Route = createFileRoute("/account")({ component: CustomerPortal });

const SESSION_KEY = "sarksh-foods-customer-session";
type PortalTab = "products" | "deliveries" | "history" | "addresses" | "payments" | "account";
type AuthMode = "login" | "register" | "forgot" | "reset";
type Notice = { type: "success" | "error" | "info"; text: string } | null;

function CustomerPortal() {
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem(SESSION_KEY) || "");
  const [data, setData] = useState<CustomerBootstrap | null>(null);
  const [tab, setTab] = useState<PortalTab>("products");
  const [loading, setLoading] = useState(Boolean(sessionToken));
  const [notice, setNotice] = useState<Notice>(null);

  const signOut = useCallback(async () => {
    const token = sessionToken;
    localStorage.removeItem(SESSION_KEY);
    setSessionToken("");
    setData(null);
    setNotice(null);
    if (token) {
      try { await customerApi.logout(token); } catch { /* local logout still succeeds */ }
    }
  }, [sessionToken]);

  const refresh = useCallback(async (token = sessionToken, quiet = false) => {
    if (!token) return;
    if (!quiet) setLoading(true);
    try {
      const next = await customerApi.bootstrap(token);
      setData(next);
      if (!quiet) setNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your account could not be loaded.";
      if (/session|expired|invalid/i.test(message)) {
        localStorage.removeItem(SESSION_KEY);
        setSessionToken("");
        setData(null);
        setNotice({ type: "error", text: "Your session expired. Sign in again." });
      } else {
        setNotice({ type: "error", text: message });
      }
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (sessionToken) void refresh(sessionToken);
  }, [sessionToken, refresh]);

  function acceptSession(token: string) {
    localStorage.setItem(SESSION_KEY, token);
    setSessionToken(token);
    setNotice(null);
  }

  if (!sessionToken) return <CustomerAuth onSession={acceptSession} notice={notice} setNotice={setNotice} />;

  return (
    <div className="customer-shell">
      <aside className="customer-sidebar">
        <Link to="/" className="customer-brand" aria-label="SARKSH Foods home">
          <img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods" />
          <div><strong>SARKSH FOODS</strong><span>Customer</span></div>
        </Link>
        <nav className="customer-nav" aria-label="Customer portal">
          <PortalNav active={tab === "products"} onClick={() => setTab("products")} icon={<ShoppingBag size={18} />} label="Products" />
          <PortalNav active={tab === "deliveries"} onClick={() => setTab("deliveries")} icon={<PackageCheck size={18} />} label="Past deliveries" />
          <PortalNav active={tab === "history"} onClick={() => setTab("history")} icon={<History size={18} />} label="Order history" />
          <PortalNav active={tab === "addresses"} onClick={() => setTab("addresses")} icon={<MapPin size={18} />} label="Addresses" />
          <PortalNav active={tab === "payments"} onClick={() => setTab("payments")} icon={<CreditCard size={18} />} label="Payments" />
          <PortalNav active={tab === "account"} onClick={() => setTab("account")} icon={<UserRound size={18} />} label="Account" />
        </nav>
        <div className="customer-sidebar-foot">
          <span>Signed in as</span>
          <strong>{data?.customer.name || "Customer"}</strong>
          <small>{data?.customer.email || ""}</small>
          <button type="button" onClick={() => void signOut()}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="customer-main">
        <header className="customer-topbar">
          <div>
            <span className="customer-kicker">SARKSH Foods · My account</span>
            <h1>{portalTitle(tab)}</h1>
          </div>
          <div className="customer-top-actions">
            <Link to="/"><ArrowLeft size={16} /> Storefront</Link>
            <button type="button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} className={loading ? "customer-spin" : ""} /> Refresh</button>
          </div>
        </header>

        {notice ? <div className={`customer-notice customer-notice--${notice.type}`}>{notice.text}</div> : null}
        {loading && !data ? <CustomerLoading /> : null}
        {data ? (
          <>
            <MobilePortalNav tab={tab} setTab={setTab} />
            {tab === "products" ? <ProductsTab data={data} token={sessionToken} refresh={refresh} setNotice={setNotice} setTab={setTab} /> : null}
            {tab === "deliveries" ? <DeliveriesTab data={data} token={sessionToken} refresh={refresh} setNotice={setNotice} setTab={setTab} /> : null}
            {tab === "history" ? <HistoryTab data={data} token={sessionToken} refresh={refresh} setNotice={setNotice} setTab={setTab} /> : null}
            {tab === "addresses" ? <AddressesTab data={data} token={sessionToken} refresh={refresh} setNotice={setNotice} /> : null}
            {tab === "payments" ? <PaymentsTab data={data} /> : null}
            {tab === "account" ? <AccountTab data={data} token={sessionToken} onSession={acceptSession} setNotice={setNotice} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}

function CustomerAuth({ onSession, notice, setNotice }: { onSession: (token: string) => void; notice: Notice; setNotice: (notice: Notice) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  function changeMode(next: AuthMode) {
    setMode(next);
    setNotice(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "register") {
        const password = String(form.get("password") || "");
        const confirm = String(form.get("confirmPassword") || "");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const result = await customerApi.register({
          fullName: String(form.get("fullName") || ""),
          phone: String(form.get("phone") || ""),
          email: String(form.get("email") || ""),
          password,
        });
        onSession(result.sessionToken);
      } else if (mode === "login") {
        const result = await customerApi.login(String(form.get("email") || ""), String(form.get("password") || ""));
        onSession(result.sessionToken);
      } else if (mode === "forgot") {
        const email = String(form.get("email") || "");
        const result = await customerApi.requestPasswordReset(email);
        setResetEmail(email);
        setNotice({ type: "info", text: result.message });
        setMode("reset");
      } else {
        const password = String(form.get("password") || "");
        const confirm = String(form.get("confirmPassword") || "");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const email = String(form.get("email") || resetEmail);
        const result = await customerApi.resetPassword(email, String(form.get("code") || ""), password);
        setNotice({ type: "success", text: result.message });
        setMode("login");
      }
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "The request could not be completed." });
    } finally {
      setBusy(false);
    }
  }

  const passwordLabel = mode === "reset" ? "New password" : "Password";

  return (
    <main className="customer-auth-page">
      <section className="customer-auth-visual">
        <Link to="/" className="customer-auth-logo"><img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods" /></Link>
        <div className="customer-auth-copy">
          <span>MY SARKSH</span>
          <h1>Your orders, addresses and favourites—kept together.</h1>
          <p>Sign in once, save your delivery details, track past orders and reorder without filling the same information again.</p>
          <div className="customer-auth-points">
            <span><MapPin size={17} /> Saved delivery addresses</span>
            <span><History size={17} /> Order history & reorder</span>
            <span><ShieldCheck size={17} /> Passwords are never stored in plain text</span>
          </div>
        </div>
      </section>

      <section className="customer-auth-form-wrap">
        <div className="customer-auth-card">
          <Link to="/" className="customer-auth-back"><ArrowLeft size={15} /> Back to SARKSH Foods</Link>
          <span className="customer-kicker">Customer account</span>
          <h2>{mode === "register" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "reset" ? "Enter reset code" : "Welcome back"}</h2>
          <p>{mode === "register" ? "Create an account for faster repeat ordering." : mode === "forgot" ? "We’ll email a short-lived reset code if the account exists." : mode === "reset" ? "Use the code from your email and choose a new password." : "Sign in to continue to your SARKSH Foods account."}</p>

          <div className="customer-auth-tabs" aria-label="Account mode">
            <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => changeMode("login")}>Sign in</button>
            <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => changeMode("register")}>Create account</button>
          </div>

          {notice ? <div className={`customer-notice customer-notice--${notice.type}`}>{notice.text}</div> : null}

          <form className="customer-auth-form" onSubmit={submit}>
            {mode === "register" ? <AuthField name="fullName" label="Full name" autoComplete="name" required /> : null}
            {mode === "register" ? <AuthField name="phone" label="Mobile number" autoComplete="tel" inputMode="tel" required /> : null}
            <AuthField name="email" label="Email address" type="email" autoComplete="email" defaultValue={mode === "reset" ? resetEmail : ""} required />
            {mode === "reset" ? <AuthField name="code" label="Reset code" inputMode="numeric" autoComplete="one-time-code" required /> : null}
            {mode !== "forgot" ? (
              <label className="customer-auth-field">
                <span>{passwordLabel}</span>
                <div className="customer-password-input">
                  <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} required />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </label>
            ) : null}
            {mode === "register" || mode === "reset" ? <AuthField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required /> : null}
            {mode === "register" || mode === "reset" ? <small className="customer-password-note">Use at least 10 characters with a letter and a number.</small> : null}
            <button className="customer-primary customer-auth-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="customer-spin" /> Please wait</> : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset code" : mode === "reset" ? "Update password" : "Sign in"}</button>
          </form>

          {mode === "login" ? <button type="button" className="customer-text-button" onClick={() => changeMode("forgot")}>Forgot password?</button> : null}
          {mode === "forgot" || mode === "reset" ? <button type="button" className="customer-text-button" onClick={() => changeMode("login")}>Return to sign in</button> : null}
        </div>
      </section>
    </main>
  );
}

function ProductsTab({ data, token, refresh, setNotice, setTab }: PortalProps) {
  return (
    <div className="customer-content-stack">
      <PortalIntro title="Order from your account" text="Choose a product, quantity and one of your saved addresses. Your contact and delivery details stay ready for the next order." />
      {!data.addresses.length ? <EmptyAction icon={<MapPin size={24} />} title="Add a delivery address first" text="Save your home or other delivery address once, then use it for repeat orders." action="Add address" onClick={() => setTab("addresses")} /> : null}
      <section className="customer-product-grid">
        {data.products.map((product) => <CustomerProductCard key={product.id} product={product} addresses={data.addresses} token={token} refresh={refresh} setNotice={setNotice} />)}
        {!data.products.length ? <EmptyAction icon={<Package size={24} />} title="No products available" text="Products marked Active by SARKSH Foods will appear here." /> : null}
      </section>
    </div>
  );
}

function CustomerProductCard({ product, addresses, token, refresh, setNotice }: { product: CustomerProduct; addresses: CustomerAddress[]; token: string; refresh: PortalProps["refresh"]; setNotice: PortalProps["setNotice"] }) {
  const defaultAddress = addresses.find((item) => item.isDefault)?.id || addresses[0]?.id || "";
  const [quantity, setQuantity] = useState(1);
  const [addressId, setAddressId] = useState(defaultAddress);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!addressId && defaultAddress) setAddressId(defaultAddress); }, [addressId, defaultAddress]);

  async function order() {
    if (!addressId) return setNotice({ type: "error", text: "Add or select a delivery address first." });
    setBusy(true);
    try {
      const result = await customerApi.createOrder(token, { productSlug: product.slug, quantity, addressId });
      setNotice({ type: "success", text: `Order request ${result.id} was created.` });
      await refresh(token, true);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Order could not be created." });
    } finally { setBusy(false); }
  }

  const image = product.imageUrl || "/assets/chilli-pack-front.webp";
  return (
    <article className="customer-product-card">
      <div className="customer-product-media"><img src={image} alt={`${product.name} ${product.packSize}`} /></div>
      <div className="customer-product-body">
        <span>{product.category} · {product.packSize}</span>
        <h2>{product.name}</h2>
        <p>{product.shortDescription || "SARKSH Foods product available for customer orders."}</p>
        <strong className="customer-stock-label">{product.stockLabel}</strong>
        <div className="customer-order-controls">
          <label><span>Quantity</span><input type="number" min={1} max={1000} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} /></label>
          <label><span>Deliver to</span><select value={addressId} onChange={(e) => setAddressId(e.target.value)} disabled={!addresses.length}><option value="">Choose address</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} · {address.city} · {address.pincode}</option>)}</select></label>
        </div>
        <button type="button" className="customer-primary" disabled={busy || !addresses.length} onClick={() => void order()}>{busy ? <LoaderCircle size={17} className="customer-spin" /> : <ShoppingBag size={17} />} {busy ? "Creating order…" : "Order product"}</button>
      </div>
    </article>
  );
}

function DeliveriesTab({ data, token, refresh, setNotice, setTab }: PortalProps) {
  const delivered = data.orders.filter((order) => ["Delivered", "Closed"].includes(order.status));
  return <OrderCollection title="Past deliveries" text="Completed SARKSH Foods orders kept together for quick reference and reordering." orders={delivered} data={data} token={token} refresh={refresh} setNotice={setNotice} setTab={setTab} empty="No completed deliveries yet." />;
}

function HistoryTab({ data, token, refresh, setNotice, setTab }: PortalProps) {
  return <OrderCollection title="Order history" text="Every order request linked to your account, including current and completed orders." orders={data.orders} data={data} token={token} refresh={refresh} setNotice={setNotice} setTab={setTab} empty="No orders yet." />;
}

function OrderCollection({ title, text, orders, data, token, refresh, setNotice, setTab, empty }: { title: string; text: string; orders: CustomerOrder[]; data: CustomerBootstrap; token: string; refresh: PortalProps["refresh"]; setNotice: PortalProps["setNotice"]; setTab: (tab: PortalTab) => void; empty: string }) {
  const defaultAddress = data.addresses.find((item) => item.isDefault)?.id || data.addresses[0]?.id || "";
  async function reorder(order: CustomerOrder) {
    if (!defaultAddress) { setTab("addresses"); return setNotice({ type: "info", text: "Save a delivery address before reordering." }); }
    try {
      const result = await customerApi.reorder(token, order.reference, defaultAddress);
      setNotice({ type: "success", text: `Reorder created as ${result.id}.` });
      await refresh(token, true);
    } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Reorder could not be created." }); }
  }
  return (
    <div className="customer-content-stack">
      <PortalIntro title={title} text={text} />
      <section className="customer-order-list">
        {orders.map((order) => (
          <article className="customer-order-card" key={order.reference}>
            <div className="customer-order-head"><div><span>{formatDate(order.createdAt)}</span><h3>{order.productName} · {order.packSize}</h3></div><OrderStatus value={order.status} /></div>
            <dl><div><dt>Reference</dt><dd>{order.reference}</dd></div><div><dt>Quantity</dt><dd>{order.quantity}</dd></div><div><dt>Delivery</dt><dd>{order.pincode}</dd></div><div><dt>Payment</dt><dd>{order.paymentStatus || "Not initiated"}</dd></div></dl>
            <p>{order.address}</p>
            <button type="button" className="customer-secondary" onClick={() => void reorder(order)}><RefreshCw size={15} /> Reorder</button>
          </article>
        ))}
        {!orders.length ? <EmptyAction icon={<History size={24} />} title={empty} text="Your order activity will appear here after you place an order." action="Browse products" onClick={() => setTab("products")} /> : null}
      </section>
    </div>
  );
}

function AddressesTab({ data, token, refresh, setNotice }: Omit<PortalProps, "setTab">) {
  const blank = useMemo<Partial<CustomerAddress>>(() => ({ label: "Home", country: "India", isDefault: data.addresses.length === 0 }), [data.addresses.length]);
  const [editing, setEditing] = useState<Partial<CustomerAddress>>(blank);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await customerApi.saveAddress(token, editing);
      setNotice({ type: "success", text: editing.id ? "Address updated." : "Address saved." });
      setEditing(blank);
      await refresh(token, true);
    } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Address could not be saved." }); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    setBusy(true);
    try { await customerApi.deleteAddress(token, id); setNotice({ type: "success", text: "Address removed." }); setEditing(blank); await refresh(token, true); }
    catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Address could not be removed." }); }
    finally { setBusy(false); }
  }

  return (
    <div className="customer-content-stack">
      <PortalIntro title="Saved addresses" text="Keep delivery details ready so repeat orders take only a few steps." />
      <section className="customer-address-grid">
        {data.addresses.map((address) => (
          <article className="customer-address-card" key={address.id}>
            <div className="customer-address-title">{address.label.toLowerCase().includes("office") ? <Briefcase size={19} /> : <Home size={19} />}<div><strong>{address.label}</strong>{address.isDefault ? <span>Default</span> : null}</div></div>
            <p><strong>{address.recipientName}</strong><br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}{address.landmark ? `, ${address.landmark}` : ""}<br />{address.city}{address.district ? `, ${address.district}` : ""}, {address.state} - {address.pincode}<br />{address.phone}</p>
            <div><button type="button" onClick={() => setEditing(address)}><Edit3 size={15} /> Edit</button><button type="button" onClick={() => void remove(address.id)} disabled={busy}><Trash2 size={15} /> Remove</button></div>
          </article>
        ))}
        {!data.addresses.length ? <EmptyAction icon={<MapPin size={24} />} title="No saved addresses" text="Add your first delivery address below." /> : null}
      </section>

      <section className="customer-panel">
        <header><div><span className="customer-kicker">Delivery address</span><h2>{editing.id ? "Edit address" : "Add an address"}</h2></div>{editing.id ? <button type="button" className="customer-text-button" onClick={() => setEditing(blank)}>Cancel edit</button> : null}</header>
        <form className="customer-address-form" onSubmit={save}>
          <AddressField label="Label" value={editing.label || ""} onChange={(value) => setEditing((v) => ({ ...v, label: value }))} placeholder="Home / Office" required />
          <AddressField label="Recipient name" value={editing.recipientName || data.customer.name} onChange={(value) => setEditing((v) => ({ ...v, recipientName: value }))} required />
          <AddressField label="Mobile number" value={editing.phone || data.customer.phone} onChange={(value) => setEditing((v) => ({ ...v, phone: value }))} required />
          <AddressField label="Address line 1" value={editing.line1 || ""} onChange={(value) => setEditing((v) => ({ ...v, line1: value }))} placeholder="House / flat / building" required />
          <AddressField label="Address line 2" value={editing.line2 || ""} onChange={(value) => setEditing((v) => ({ ...v, line2: value }))} placeholder="Street / area" />
          <AddressField label="Landmark" value={editing.landmark || ""} onChange={(value) => setEditing((v) => ({ ...v, landmark: value }))} />
          <AddressField label="City" value={editing.city || ""} onChange={(value) => setEditing((v) => ({ ...v, city: value }))} required />
          <AddressField label="District" value={editing.district || ""} onChange={(value) => setEditing((v) => ({ ...v, district: value }))} />
          <AddressField label="State" value={editing.state || ""} onChange={(value) => setEditing((v) => ({ ...v, state: value }))} required />
          <AddressField label="PIN code" value={editing.pincode || ""} onChange={(value) => setEditing((v) => ({ ...v, pincode: value }))} required />
          <AddressField label="Country" value={editing.country || "India"} onChange={(value) => setEditing((v) => ({ ...v, country: value }))} required />
          <label className="customer-check"><input type="checkbox" checked={Boolean(editing.isDefault)} onChange={(e) => setEditing((v) => ({ ...v, isDefault: e.target.checked }))} /><span>Use as default delivery address</span></label>
          <div className="customer-form-actions"><button className="customer-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="customer-spin" /> : <MapPin size={16} />} {busy ? "Saving…" : "Save address"}</button></div>
        </form>
      </section>
    </div>
  );
}

function PaymentsTab({ data }: { data: CustomerBootstrap }) {
  return (
    <div className="customer-content-stack">
      <PortalIntro title="Payments" text="The account is ready for a payment gateway, but online payments are intentionally not activated in this release." />
      <section className="customer-payment-card">
        <div className="customer-payment-icon"><CreditCard size={28} /></div>
        <div><span>Planned gateway</span><h2>{data.payments.provider}</h2><p>{data.payments.message}</p></div>
        <strong>Not enabled</strong>
      </section>
      <section className="customer-security-note"><ShieldCheck size={20} /><div><strong>No card data is stored by SARKSH Foods.</strong><p>When Razorpay is connected later, payment credentials should remain with the payment provider rather than Google Sheets.</p></div></section>
    </div>
  );
}

function AccountTab({ data, token, onSession, setNotice }: { data: CustomerBootstrap; token: string; onSession: (token: string) => void; setNotice: PortalProps["setNotice"] }) {
  const [busy, setBusy] = useState(false);
  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = String(form.get("currentPassword") || "");
    const next = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (next !== confirm) return setNotice({ type: "error", text: "New passwords do not match." });
    setBusy(true);
    try {
      const result = await customerApi.changePassword(token, current, next);
      onSession(result.sessionToken);
      (event.currentTarget as HTMLFormElement).reset();
      setNotice({ type: "success", text: "Password updated. Other customer sessions were signed out." });
    } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Password could not be changed." }); }
    finally { setBusy(false); }
  }
  return (
    <div className="customer-content-stack">
      <PortalIntro title="Your account" text="Profile identity and password controls for your SARKSH Foods customer account." />
      <section className="customer-profile-grid">
        <div><span>Name</span><strong>{data.customer.name}</strong></div><div><span>Mobile</span><strong>{data.customer.phone}</strong></div><div><span>Email</span><strong>{data.customer.email}</strong></div><div><span>Customer ID</span><strong>{data.customer.id}</strong></div>
      </section>
      <section className="customer-panel customer-password-panel">
        <header><div><span className="customer-kicker">Security</span><h2>Change password</h2></div></header>
        <form onSubmit={changePassword} className="customer-password-form">
          <AuthField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required />
          <AuthField name="newPassword" label="New password" type="password" autoComplete="new-password" required />
          <AuthField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" required />
          <button type="submit" className="customer-primary" disabled={busy}>{busy ? <LoaderCircle size={16} className="customer-spin" /> : <ShieldCheck size={16} />} {busy ? "Updating…" : "Update password"}</button>
        </form>
      </section>
    </div>
  );
}

type PortalProps = { data: CustomerBootstrap; token: string; refresh: (token?: string, quiet?: boolean) => Promise<void>; setNotice: (notice: Notice) => void; setTab: (tab: PortalTab) => void };

function PortalNav({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button type="button" className={active ? "is-active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>; }
function MobilePortalNav({ tab, setTab }: { tab: PortalTab; setTab: (tab: PortalTab) => void }) { const items: Array<[PortalTab, string]> = [["products", "Products"], ["deliveries", "Deliveries"], ["history", "History"], ["addresses", "Addresses"], ["payments", "Payments"], ["account", "Account"]]; return <div className="customer-mobile-tabs">{items.map(([value, label]) => <button type="button" key={value} className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>{label}</button>)}</div>; }
function PortalIntro({ title, text }: { title: string; text: string }) { return <section className="customer-intro"><div><span className="customer-kicker">My SARKSH</span><h2>{title}</h2></div><p>{text}</p></section>; }
function EmptyAction({ icon, title, text, action, onClick }: { icon: React.ReactNode; title: string; text: string; action?: string; onClick?: () => void }) { return <div className="customer-empty">{icon}<div><strong>{title}</strong><p>{text}</p></div>{action && onClick ? <button type="button" className="customer-secondary" onClick={onClick}>{action}</button> : null}</div>; }
function CustomerLoading() { return <div className="customer-loading"><LoaderCircle size={24} className="customer-spin" /><span>Loading your SARKSH account…</span></div>; }
function OrderStatus({ value }: { value: string }) { return <span className={`customer-status customer-status--${value.toLowerCase().replace(/\s+/g, "-")}`}>{value}</span>; }
function portalTitle(tab: PortalTab) { return ({ products: "Products", deliveries: "Past deliveries", history: "Order history", addresses: "Address management", payments: "Payments", account: "Account" } as const)[tab]; }
function formatDate(value: string) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
function AuthField({ name, label, type = "text", inputMode, autoComplete, defaultValue, required = false }: { name: string; label: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoComplete?: string; defaultValue?: string; required?: boolean }) { return <label className="customer-auth-field"><span>{label}{required ? " *" : ""}</span><input name={name} type={type} inputMode={inputMode} autoComplete={autoComplete} defaultValue={defaultValue} required={required} /></label>; }
function AddressField({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) { return <label className="customer-field"><span>{label}{required ? " *" : ""}</span><input value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} /></label>; }
