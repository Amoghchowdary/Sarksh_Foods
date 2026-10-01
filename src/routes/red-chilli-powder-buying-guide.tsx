import "../commercial-v14-seo.css";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SEO_DATABASE } from "@/lib/seoDatabase";

export const Route = createFileRoute("/red-chilli-powder-buying-guide")({ component: BuyingGuidePage });

const guide = SEO_DATABASE.guides.redChilliPowderBuyingGuide;

function BuyingGuidePage() {
  return (
    <>
      <section className="v14-content-hero">
        <div className="site-frame v14-content-hero-inner">
          <span className="eyebrow">RED CHILLI POWDER · BUYING GUIDE</span>
          <h1>How to Choose Red Chilli Powder for Home or Business Use</h1>
          <p>{guide.intro}</p>
        </div>
      </section>

      <section className="v14-content-page section-pad">
        <div className="site-frame v14-content-grid">
          <div className="v14-content-main">
            <div className="v14-article-stack">
              {guide.sections.map((section, index) => (
                <article key={section.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h2>{section.title}</h2><p>{section.text}</p></div>
                </article>
              ))}
            </div>

            <section className="v14-callout">
              <span className="eyebrow">SARKSH FOODS</span>
              <h2>Looking for the current SARKSH product?</h2>
              <p>The current SARKSH Foods range begins with a 1 kg chilli powder carton, with separate routes for home orders and commercial requirements.</p>
              <div className="inline-actions">
                <Link to="/chilli-powder" className="button-primary">View Chilli Powder</Link>
                <Link to="/enterprise" className="text-link">Business orders <ArrowRight size={16} /></Link>
              </div>
            </section>
          </div>

          <aside className="v14-content-aside">
            <span className="eyebrow">COMPARE BRANDS</span>
            <h3>Choosing between chilli powder brands?</h3>
            <p>Use the India brand-comparison checklist to compare verifiable product information instead of generic superlatives.</p>
            <Link to="/chilli-powder-brands-india" className="text-link">Compare what matters <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}
