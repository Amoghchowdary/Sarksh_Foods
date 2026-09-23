import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/pan-india")({ component: PanIndiaPage });
const product = PRODUCTS[0];

const regions = [
  ["South India", "Andhra Pradesh, Telangana, Tamil Nadu, Karnataka, Kerala, Puducherry, Lakshadweep"],
  ["West India", "Maharashtra, Gujarat, Goa, Rajasthan, Dadra & Nagar Haveli and Daman & Diu"],
  ["North India", "Delhi, Uttar Pradesh, Haryana, Punjab, Himachal Pradesh, Uttarakhand, Jammu & Kashmir, Ladakh, Chandigarh"],
  ["Central India", "Madhya Pradesh, Chhattisgarh"],
  ["East India", "West Bengal, Odisha, Bihar, Jharkhand"],
  ["North-East India", "Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura"],
] as const;

function PanIndiaPage() {
  return (
    <>
      <section className="about-hero">
        <div className="site-frame about-hero-grid">
          <div className="about-hero-copy page-title-card">
            <span className="eyebrow eyebrow--gold">PAN-INDIA SUPPLY</span>
            <h1>SARKSH Foods Chilli Powder, <em>across India.</em></h1>
            <p>Household and commercial enquiries are accepted across Indian states and union territories, with final delivery subject to serviceability and order confirmation.</p>
            <BookProductButton product={product} label="Order Chilli Powder" />
          </div>
          <div className="about-logo-stage"><img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" /></div>
        </div>
      </section>

      <section className="enterprise-buyers section-pad">
        <div className="site-frame">
          <div className="section-heading-row">
            <div><span className="eyebrow">INDIA COVERAGE</span><h2>One national enquiry route.</h2></div>
            <p>We do not create duplicate city pages. Instead, this page provides a single, useful view of the regions SARKSH Foods serves.</p>
          </div>
          <div className="enterprise-buyer-grid">
            {regions.map(([title, states]) => (
              <article key={title}><MapPin size={24} /><h3>{title}</h3><p>{states}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="product-story section-pad">
        <div className="site-frame product-story-grid">
          <div><span className="eyebrow">MAJOR CITY ENQUIRIES</span><h2>Serving demand from metros and growing markets.</h2></div>
          <div>
            <p>Enquiries can be submitted from Hyderabad, Bengaluru, Chennai, Mumbai, Pune, Delhi NCR, Kolkata, Ahmedabad, Jaipur, Kochi, Vijayawada, Visakhapatnam, Tirupati, Coimbatore, Lucknow, Chandigarh, Indore, Bhopal, Bhubaneswar, Patna, Guwahati and other serviceable Indian locations.</p>
            <Link to="/enterprise" className="text-link">Commercial supply enquiry <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
