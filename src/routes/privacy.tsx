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
            <p>SARKSH Foods uses customer information to operate orders, enquiries and optional customer accounts. Google Sheets and Google Drive remain private business systems; customers do not receive direct access to them.</p>
          </div>
        </div>
        <article className="contact-v75-form-card">
          <div className="contact-v75-form-head"><h2>Website privacy notice</h2></div>
          <div className="product-detail-copy">
            <h3>Orders and enquiries</h3>
            <p>We may collect your name, contact number, email, buyer type, quantity, PIN code, delivery address and requirement notes when you choose to submit them.</p>
            <h3>Customer accounts</h3>
            <p>If you create an account, we store your account identifier, name, mobile number, email, saved delivery addresses, account status, session records and order history so repeat ordering can be faster.</p>
            <h3>Passwords and sessions</h3>
            <p>Customer passwords are not stored in readable form. They are securely transformed before storage, and sign-in or password-reset credentials are protected in the same way.</p>
            <h3>Google Sheets and Drive</h3>
            <p>Order, enquiry and account records are kept in private Google Sheets and Google Drive resources controlled by SARKSH Foods. Customers do not receive direct access to these private records.</p>
            <h3>Payments</h3>
            <p>Online payments are not enabled in the current release. When a payment gateway such as Razorpay is connected, SARKSH Foods should not store card numbers, CVV values or payment credentials in Google Sheets.</p>
            <h3>Your choice</h3>
            <p>You can continue using the public website without creating a customer account. For questions about a submission or account, use the <Link to="/contact" className="text-link">contact page</Link>.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
