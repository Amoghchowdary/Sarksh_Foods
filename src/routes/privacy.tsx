import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <section className="contact-v75">
      <div className="site-frame contact-v75-grid">
        <div className="contact-v75-intro">
          <div className="contact-v75-heading">
            <span className="eyebrow eyebrow--gold">PRIVACY</span>
            <h1>Clear information about the details you share.</h1>
            <p>SARKSH Foods collects only the information needed to respond to order requests, business enquiries and delivery requirements submitted through this website.</p>
          </div>
        </div>
        <article className="contact-v75-form-card">
          <div className="contact-v75-form-head"><h2>Website privacy notice</h2></div>
          <div className="product-detail-copy">
            <h3>Information collected</h3>
            <p>Name, contact number, optional email address, buyer type, quantity, PIN code, delivery locality/address, and requirement notes when you choose to submit them.</p>
            <h3>Why it is used</h3>
            <p>To record and respond to your enquiry, confirm product availability, discuss commercial quantities, and coordinate order or delivery follow-up.</p>
            <h3>Storage</h3>
            <p>Submitted information is stored in the business order/enquiry system configured for SARKSH Foods and is intended for authorised business follow-up.</p>
            <h3>Your choice</h3>
            <p>Do not submit information you do not want to share. For questions about a previous submission, use the <Link to="/contact" className="text-link">contact page</Link>.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
