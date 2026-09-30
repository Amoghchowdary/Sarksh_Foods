import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SEO_DATABASE } from "@/lib/seoDatabase";

export const Route = createFileRoute("/chilli-powder-brands-india")({ component: BrandsGuidePage });

const guide = SEO_DATABASE.guides.chilliPowderBrandsIndia;

function BrandsGuidePage() {
  return (
    <>
      <section className="v14-content-hero">
        <div className="site-frame v14-content-hero-inner">
          <span className="eyebrow">BUYING GUIDE · INDIA</span>
          <h1>Chilli Powder Brands in India: What to Compare Before You Choose</h1>
          <p>{guide.intro}</p>
          <div className="v14-hero-links">
            <Link to="/chilli-powder" className="button-primary">View SARKSH Chilli Powder</Link>
            <Link to="/faq" className="button-secondary">Read FAQ</Link>
          </div>
        </div>
      </section>

      <section className="v14-content-page section-pad">
        <div className="site-frame v14-content-grid">
          <div className="v14-content-main">
            <div className="v14-guide-intro">
              <span className="eyebrow">A PRACTICAL COMPARISON FRAMEWORK</span>
              <h2>Seven checks are more useful than one “best brand” label.</h2>
              <p>Search results often mix manufacturers, marketplaces and retailer pages. A reliable comparison starts with information you can verify on the pack or the brand’s own product pages.</p>
            </div>
            <div className="v14-check-grid">
              {guide.criteria.map((item, index) => (
                <article className="v14-check-card" key={item.title}>
                  <div className="v14-check-number">{String(index + 1).padStart(2, "0")}</div>
                  <CheckCircle2 size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <section className="v14-brand-proof">
              <span className="eyebrow">SARKSH FOODS · PUBLISHED PRODUCT FACTS</span>
              <h2>What SARKSH Foods currently publishes for buyers to compare.</h2>
              <div className="v14-proof-grid">
                <div><span>Product</span><strong>SARKSH Foods Chilli Powder</strong></div>
                <div><span>Pack</span><strong>1 kg carton</strong></div>
                <div><span>Market</span><strong>India</strong></div>
                <div><span>Buyer routes</span><strong>Home + business enquiries</strong></div>
                <div><span>FSSAI</span><strong>{SEO_DATABASE.site.fssaiRegistrationNumber}</strong></div>
                <div><span>Brand line</span><strong>Legacy of Elegance</strong></div>
              </div>
              <p className="v14-disclosure">SARKSH Foods does not claim that one product is objectively the best choice for every buyer. Product choice depends on intended use, preference and verified product information.</p>
            </section>
          </div>

          <aside className="v14-content-aside">
            <span className="eyebrow">BUYING NEXT</span>
            <h3>Need the ingredient-level buying checklist?</h3>
            <p>Read the red chilli powder buying guide for colour, heat, pack, label and storage checks.</p>
            <Link to="/red-chilli-powder-buying-guide" className="text-link">Open buying guide <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}
