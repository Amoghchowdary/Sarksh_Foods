import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";
import { submitWebsiteRequest } from "@/lib/api";

export const Route = createFileRoute("/contact")({ component: ContactPage });

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().min(7, "Please enter a contact number").max(24),
  email: z.string().trim().max(120).optional(),
  interest: z.string().trim().max(120).optional(),
  message: z.string().trim().min(4, "Please add a short message").max(1200),
});

type EnquiryValues = z.infer<typeof enquirySchema>;
type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error" };

function ContactPage() {
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryValues, string>>>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = enquirySchema.safeParse(Object.fromEntries(new FormData(form).entries()));

    if (!parsed.success) {
      const next: Partial<Record<keyof EnquiryValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof EnquiryValues | undefined;
        if (field && !next[field]) next[field] = issue.message;
      }
      setErrors(next);
      setStatus({ type: "idle" });
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>(".field-invalid")?.focus();
      });
      return;
    }

    setErrors({});
    setStatus({ type: "submitting" });

    try {
      await submitWebsiteRequest("enquiry", parsed.data);
      form.reset();
      setStatus({ type: "success" });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error" });
    }
  }

  return (
    <section className="contact-v75">
      <div className="site-frame contact-v75-grid">
        <aside className="contact-v75-intro">
          <div className="contact-v75-heading">
            <span className="eyebrow eyebrow--gold">CONTACT &amp; ORDERS</span>
            <h1>Let&apos;s get your requirement moving.</h1>
            <p>
              Home order, retail, wholesale, distribution, HoReCa or institutional requirement—share the details once and use one clear route for follow-up.
            </p>
          </div>

          <div className="contact-v75-actions" aria-label="Quick contact routes">
            <BookProductButton product={PRODUCTS[0]} className="contact-v75-action contact-v75-action--primary" label="Order Chilli Powder" />
            <Link to="/enterprise" className="contact-v75-action">
              <Building2 size={19} /> Business requirements <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="contact-v75-trust" aria-label="Food safety registration details">
            <div className="contact-v75-trust-icon"><ShieldCheck size={25} /></div>
            <div className="contact-v75-trust-copy">
              <span>FOOD SAFETY REGISTRATION</span>
              <strong>FSSAI Registered</strong>
              <dl>
                <div><dt>Registration No.</dt><dd>23626023001557</dd></div>
              </dl>
            </div>
          </div>

        </aside>

        <div className="contact-v75-form-card">
          <div className="contact-v75-form-head">
            <span className="eyebrow eyebrow--gold">SEND A REQUIREMENT</span>
            <h2>Tell us what you need.</h2>

          </div>

          <form className="contact-form contact-v75-form" onSubmit={onSubmit} noValidate onInput={() => {
            if (status.type === "success" || status.type === "error") setStatus({ type: "idle" });
          }}>
              <div className="form-grid contact-v75-form-grid">
                <Field name="name" label="Full name" error={errors.name} required />
                <Field name="phone" label="Contact number" error={errors.phone} inputMode="tel" required />
                <Field name="email" label="Email address" error={errors.email} type="email" />
                <div>
                  <label className="form-label" htmlFor="interest">Requirement type</label>
                  <select className="form-control mt-2" id="interest" name="interest" defaultValue="Product order">
                    <option>Product order</option>
                    <option>Retail</option>
                    <option>Wholesale</option>
                    <option>Distribution</option>
                    <option>Hotel / Restaurant / Caterer</option>
                    <option>Institutional</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="contact-v75-message">
                <label className="form-label" htmlFor="message">Requirement details *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`form-control mt-2 resize-y ${errors.message ? "field-invalid" : ""}`}
                  placeholder="Product, quantity, buyer type, delivery city / PIN code, and any other useful detail."
                />
              </div>

              <div className="contact-v75-submit-row contact-v77-submit-row">
                <button type="submit" className="button-primary" disabled={status.type === "submitting"}>
                  {status.type === "submitting" ? (
                    <><LoaderCircle size={17} className="animate-spin" /> Sending</>
                  ) : status.type === "success" ? (
                    <><CheckCircle2 size={17} /> Enquiry sent</>
                  ) : status.type === "error" ? (
                    <><ShoppingBag size={17} /> Try again</>
                  ) : (
                    <><ShoppingBag size={17} /> Send enquiry</>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  error,
  type = "text",
  required = false,
  inputMode,
}: {
  name: keyof EnquiryValues;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="form-label" htmlFor={name}>{label}{required ? " *" : ""}</label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        className={`form-control mt-2 ${error ? "field-invalid" : ""}`}
      />
    </div>
  );
}
