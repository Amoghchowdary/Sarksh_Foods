import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, PackageCheck, ShoppingBag, Store, Truck, UtensilsCrossed } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/")({ component: Home });
const product = PRODUCTS[0];

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="site-frame home-hero-grid">
          <div className="home-hero-copy">
            <span className="eyebrow">SARKSH FOODS · CHILLI POWDER</span>
            <h1>Bold colour.<br />Full flavour.<br /><em>Distinctly SARKSH.</em></h1>
            <p className="hero-lead">Premium chilli powder for homes, retail shelves and professional kitchens, available in a 1 kg carton with pan-India order and business-enquiry routes.</p>
            <div className="hero-actions">
              <BookProductButton product={product} label="Order Chilli Powder" />
              <Link to="/enterprise" className="button-secondary">Business orders <ArrowUpRight size={17} /></Link>
            </div>
            <div className="hero-facts" aria-label="Product facts">
              <div><strong>1 kg</strong><span>Carton</span></div>
              <div><strong>Home</strong><span>Order route</span></div>
              <div><strong>Business</strong><span>Bulk enquiries</span></div>
            </div>
          </div>

          <div className="home-hero-visual home-hero-logo-visual" aria-label="SARKSH Foods official logo — Legacy of Elegance">
            <img
              className="hero-brand-logo"
              src="/assets/logos/sarksh-foods-logo.svg"
              alt="SARKSH Foods — Legacy of Elegance"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="spice-marquee" aria-label="Guntur chilli varieties and SARKSH Foods processing flow">
        <div className="spice-marquee-label">
          <span>GUNTUR CHILLI</span>
          <strong>VARIETIES &amp; PROCESS</strong>
        </div>
        <div className="spice-marquee-window">
          <div className="spice-marquee-track">
            {[0, 1].map((loop) => (
              <div className="spice-marquee-group" aria-hidden={loop === 1 ? true : undefined} key={loop}>
                <span className="spice-marquee-item"><b>Guntur Sannam S4</b><small>Chilli variety</small></span>
                <i />
                <span className="spice-marquee-item"><b>Teja</b><small>Chilli variety</small></span>
                <i />
                <span className="spice-marquee-item"><b>273</b><small>Chilli variety</small></span>
                <i />
                <span className="spice-marquee-item"><b>Byadagi</b><small>Chilli variety</small></span>
                <i />
                <span className="spice-marquee-item spice-process"><b>Sourced</b><small>Selected lots</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Sorted</b><small>Quality grading</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Cleaned</b><small>Foreign matter removed</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Destemmed</b><small>Prepared for grinding</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Ground</b><small>Chilli to powder</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Sieved</b><small>Consistent finish</small></span>
                <span className="spice-arrow">→</span>
                <span className="spice-marquee-item spice-process"><b>Packed</b><small>Ready for dispatch</small></span>
                <i />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="promise-section section-pad">
        <div className="site-frame promise-grid">
          <div className="section-intro">
            <span className="eyebrow">THE SARKSH PROMISE</span>
            <h2>A chilli powder designed to be noticed before the first pinch.</h2>
            <p>Strong shelf presence, a clear product story and the familiar confidence of a kitchen essential—brought together under the SARKSH Foods identity.</p>
          </div>
          <div className="promise-features">
            <article><span>01</span><h3>100% Pure &amp; Natural</h3><p>An on-pack promise presented clearly on the 1 kg carton.</p></article>
            <article><span>02</span><h3>Rich Colour. Bold Flavour.</h3><p>Created to bring visible character and flavour to everyday cooking.</p></article>
            <article><span>03</span><h3>No Added Preservatives</h3><p>A simple, direct product message customers can understand at a glance.</p></article>
          </div>
        </div>
      </section>

      <section className="product-focus section-pad">
        <div className="site-frame product-focus-grid">
          <div className="product-focus-media">
            <div className="product-focus-backdrop" />
            <img src="/assets/chilli-pack-front.webp" alt="SARKSH Foods Chilli Powder 1 kg carton" loading="lazy" />
          </div>
          <div className="product-focus-copy">
            <span className="eyebrow">OUR PRODUCT</span>
            <h2>Chilli Powder</h2>
            <p className="section-lead">One pack. One clear identity. Ready for home and business orders.</p>
            <p>The current SARKSH Foods range begins with a 1 kg chilli powder carton. Order for household use or share a larger requirement through the business route.</p>
            <div className="product-points">
              <span><Check size={17} /> 1 kg carton</span>
              <span><Check size={17} /> Home order requests</span>
              <span><Check size={17} /> Retail, wholesale &amp; HoReCa enquiries</span>
            </div>
            <div className="inline-actions">
              <BookProductButton product={product} label="Order 1 kg carton" />
              <Link to="/chilli-powder" className="text-link">Explore Chilli Powder <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="buyer-section section-pad">
        <div className="site-frame">
          <div className="section-heading-row">
            <div><span className="eyebrow eyebrow--gold">BUILT FOR THE MARKET</span><h2>From one kitchen to an entire supply chain.</h2></div>
            <p>Choose the buying route that matches your requirement. Household orders stay simple; commercial quantities move through SARKSH Foods Business.</p>
          </div>
          <div className="buyer-cards">
            <article><ShoppingBag size={25} /><span>01</span><h3>Home</h3><p>Order the current 1 kg carton for household use.</p><BookProductButton product={product} className="text-button" label="Order for home" /></article>
            <article><Store size={25} /><span>02</span><h3>Retail &amp; Wholesale</h3><p>Share quantities for store, resale or wholesale requirements.</p><Link to="/enterprise" className="text-button">Business orders <ArrowRight size={15} /></Link></article>
            <article><UtensilsCrossed size={25} /><span>03</span><h3>HoReCa</h3><p>Send requirements for hotels, restaurants, caterers and institutions.</p><Link to="/enterprise" className="text-button">Food-service orders <ArrowRight size={15} /></Link></article>
            <article><Truck size={25} /><span>04</span><h3>Distribution</h3><p>Start a conversation for larger market and distribution requirements.</p><Link to="/enterprise" className="text-button">Distribution enquiry <ArrowRight size={15} /></Link></article>
          </div>
        </div>
      </section>

      <section className="brand-band section-pad">
        <div className="site-frame brand-band-grid">
          <div className="brand-band-logo"><img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" /></div>
          <div className="brand-band-copy">
            <span className="eyebrow eyebrow--gold">LEGACY OF ELEGANCE</span>
            <h2>A brand built to be recognised.</h2>
            <p>The temple, palms, maroon and gold form the visual signature of SARKSH Foods. The same identity carries from the pack to the website, so the brand stays familiar wherever customers meet it.</p>
            <Link to="/about" className="button-light">Our story <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="site-frame home-cta-inner">
          <div><span className="eyebrow">READY TO ORDER?</span><h2>Order SARKSH Foods Chilli Powder for home or business, with enquiries accepted across India.</h2></div>
          <div className="home-cta-actions"><BookProductButton product={product} label="Order now" /><Link to="/enterprise" className="button-secondary">Business orders <ArrowUpRight size={17} /></Link></div>
        </div>
      </section>
    </>
  );
}
