import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, PackageCheck, Store, UtensilsCrossed } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/chilli-powder")({ component: ChilliPowderPage });
const product = PRODUCTS[0];

function ChilliPowderPage() {
  return (
    <>
      <section className="product-detail-hero">
        <div className="site-frame product-detail-grid">
          <div className="product-detail-media">
            <img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt="SARKSH Foods premium chilli powder 1 kg carton" fetchPriority="high" />
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">SARKSH FOODS · PREMIUM CHILLI POWDER</span>
            <h1>SARKSH Foods Chilli Powder</h1>
            <p className="product-detail-tagline">Bold colour. Full flavour. Distinctly SARKSH.</p>
            <p>SARKSH Foods Chilli Powder is a premium red chilli powder, also commonly searched as chili powder, available in a 1 kg carton for household, retail, wholesale, HoReCa, distribution and institutional requirements across India.</p>
            <div className="detail-specs">
              <div><span>Pack size</span><strong>1 kg</strong></div>
              <div><span>Category</span><strong>Ground Spice</strong></div>
              <div><span>Supply</span><strong>Pan India</strong></div>
            </div>
            <ul className="check-list">
              <li><Check size={17} /> 100% Pure &amp; Natural — on-pack statement</li>
              <li><Check size={17} /> Rich Colour · Bold Flavour — on-pack statement</li>
              <li><Check size={17} /> No Added Preservatives — on-pack statement</li>
            </ul>
            <div className="inline-actions">
              <BookProductButton product={product} label="Order Chilli Powder" />
              <Link to="/enterprise" className="text-link">Business quantity <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="product-story section-pad">
        <div className="site-frame product-story-grid">
          <div><span className="eyebrow">CHILLI POWDER IN INDIA</span><h2>One premium chilli powder for homes and professional kitchens.</h2></div>
          <p>Order for home use or share a business requirement for retail, wholesale, hotels, restaurants, catering, distribution or institutional use. Enquiries are accepted from across India, subject to final serviceability.</p>
        </div>
      </section>

      <section className="order-options section-pad">
        <div className="site-frame">
          <div className="section-heading-row">
            <div><span className="eyebrow">WHO IT IS FOR</span><h2>From the pantry shelf to professional kitchens.</h2></div>
            <p>Choose home ordering or business ordering for the same 1 kg SARKSH Foods Chilli Powder carton.</p>
          </div>
          <div className="order-option-grid">
            <article><PackageCheck size={25} /><h3>Home orders</h3><p>Order the 1 kg carton for household use.</p><BookProductButton product={product} className="text-button" label="Order for home" /></article>
            <article><Store size={25} /><h3>Retail &amp; wholesale</h3><p>Share quantity and delivery location for trade requirements.</p><Link to="/enterprise" className="text-button">Business orders <ArrowRight size={15} /></Link></article>
            <article><UtensilsCrossed size={25} /><h3>HoReCa &amp; institutions</h3><p>Send professional-kitchen and institutional requirements.</p><Link to="/enterprise" className="text-button">Share requirement <ArrowRight size={15} /></Link></article>
          </div>
        </div>
      </section>

      <section className="product-story section-pad">
        <div className="site-frame product-story-grid">
          <div><span className="eyebrow">PAN-INDIA SUPPLY</span><h2>Chilli powder enquiries from across India.</h2></div>
          <div>
            <p>SARKSH Foods accepts order and business enquiries across Indian states and major cities, subject to final serviceability and delivery confirmation.</p>
            <Link to="/pan-india" className="text-link"><MapPin size={16} /> View pan-India coverage <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="product-story section-pad">
        <div className="site-frame product-story-grid">
          <div><span className="eyebrow">CHOOSING CHILLI POWDER</span><h2>What should you look for in a premium chilli powder?</h2></div>
          <div><p>People searching for the best chilli powder in India usually compare colour, flavour, pack clarity, consistency and trust in the brand. SARKSH Foods presents those product cues clearly on the 1 kg carton without making unsupported ranking claims.</p><p>Chilli powder is also commonly searched as <strong>chili powder</strong> or <strong>red chilli powder</strong>; this page refers to the same ground-spice category.</p></div>
        </div>
      </section>

      <section className="brand-principles section-pad">
        <div className="site-frame">
          <div className="section-heading-row"><div><span className="eyebrow">COMMON QUESTIONS</span><h2>Chilli powder ordering, clearly answered.</h2></div></div>
          <div className="principle-grid">
            <article><span>01</span><h3>What pack size is available?</h3><p>The current SARKSH Foods Chilli Powder pack is a 1 kg carton.</p></article>
            <article><span>02</span><h3>Can businesses order?</h3><p>Yes. Retailers, wholesalers, distributors, HoReCa buyers and institutions can submit commercial quantities.</p></article>
            <article><span>03</span><h3>Where do you supply?</h3><p>SARKSH Foods accepts pan-India enquiries, with final delivery subject to serviceability confirmation.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
