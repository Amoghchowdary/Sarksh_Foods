import { CheckCircle2, LoaderCircle, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { Product } from "@/lib/products";
import { submitWebsiteRequest } from "@/lib/api";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(24),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  buyerType: z.string().trim().min(2).max(60),
  quantity: z.coerce.number().int().min(1).max(100000),
  pincode: z.string().trim().min(4, "Enter a valid PIN code").max(12),
  address: z.string().trim().min(6, "Enter the delivery locality or address").max(500),
  notes: z.string().trim().max(600).optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;
type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; id: string }
  | { type: "error"; message: string };

type ProductBookingModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function ProductBookingModal({ product, open, onClose }: ProductBookingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingValues, string>>>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setErrors({});
      setStatus({ type: "idle" });
    }
  }, [open]);

  if (!open) return null;

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = bookingSchema.safeParse({ ...raw, quantity });

    if (!parsed.success) {
      const next: Partial<Record<keyof BookingValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof BookingValues | undefined;
        if (field && !next[field]) next[field] = issue.message;
      }
      setErrors(next);
      setStatus({ type: "idle" });
      return;
    }

    setErrors({});
    setStatus({ type: "submitting" });

    try {
      const result = await submitWebsiteRequest("booking", {
        ...parsed.data,
        productSlug: product.slug,
        productName: product.name,
        packSize: product.weight,
      });
      form.reset();
      setStatus({ type: "success", id: result.id });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "The order request could not be saved",
      });
    }
  }

  return (
    <div className="booking-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="booking-panel" role="dialog" aria-modal="true" aria-label={`Order ${product.name}`}>
        <button type="button" onClick={onClose} className="booking-close" aria-label="Close order form">
          <X size={20} />
        </button>

        <div className="booking-product booking-title-card">
          <img src={product.image} alt={`${product.name} ${product.weight}`} />
          <div>
            <span className="booking-kicker">SARKSH Foods · Chilli Powder</span>
            <h2>{product.name}</h2>
            <p>{product.weight} carton · Order request</p>
          </div>
        </div>

        {status.type === "success" ? (
          <div className="booking-success">
            <CheckCircle2 size={42} />
            <h3>Order request received.</h3>
            <p>Your order reference is <strong>{status.id}</strong>. Keep this reference for any follow-up about the requirement.</p>
            <button type="button" className="button-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={submitBooking} noValidate className="booking-form">
            <div className="booking-grid">
              <Field name="name" label="Customer name" error={errors.name} required />
              <Field name="phone" label="Phone number" error={errors.phone} required inputMode="tel" />
              <Field name="email" label="Email (optional)" error={errors.email} type="email" />
              <div>
                <label className="form-label" htmlFor="buyerType">Buying as</label>
                <select id="buyerType" name="buyerType" className="form-control mt-2" defaultValue="Household customer">
                  <option>Household customer</option>
                  <option>Retail shop</option>
                  <option>Wholesaler</option>
                  <option>Distributor</option>
                  <option>Hotel / Restaurant / Caterer</option>
                  <option>Institution / Other business</option>
                </select>
              </div>
              <div>
                <span className="form-label">Quantity</span>
                <div className="quantity-control mt-2">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={16} /></button>
                  <input aria-label="Quantity" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} inputMode="numeric" />
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus size={16} /></button>
                </div>
                {errors.quantity ? <p className="field-error">{errors.quantity}</p> : null}
              </div>
              <Field name="pincode" label="Delivery PIN code" error={errors.pincode} required inputMode="numeric" />
            </div>

            <div className="mt-5">
              <label className="form-label" htmlFor="address">Delivery locality / address *</label>
              <textarea id="address" name="address" rows={3} className={`form-control mt-2 resize-y ${errors.address ? "field-invalid" : ""}`} placeholder="Area, city, state, and delivery details" />
              {errors.address ? <p className="field-error">{errors.address}</p> : null}
            </div>

            <div className="mt-5">
              <label className="form-label" htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" name="notes" rows={2} className="form-control mt-2 resize-y" placeholder="Preferred delivery date, bulk requirement, or any other note" />
            </div>

            {status.type === "error" ? <div className="booking-error">{status.message}</div> : null}

            <div className="booking-actions">
              <p>Submitting this form records an order request and generates a reference. Price, payment, stock and final delivery are confirmed separately.</p>
              <button type="submit" className="button-primary" disabled={status.type === "submitting"}>
                {status.type === "submitting" ? <><LoaderCircle size={17} className="animate-spin" /> Submitting</> : <><ShoppingBag size={17} /> Submit order request</>}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export function BookProductButton({ product, className = "button-primary", label = "Order now" }: { product: Product; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <ShoppingBag size={17} /> {label}
      </button>
      <ProductBookingModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function Field({ name, label, error, type = "text", required = false, inputMode }: { name: keyof BookingValues; label: string; error?: string; type?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <div>
      <label className="form-label" htmlFor={name}>{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type={type} inputMode={inputMode} className={`form-control mt-2 ${error ? "field-invalid" : ""}`} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
