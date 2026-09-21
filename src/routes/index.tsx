import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  Leaf,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/")({ component: Home });
const product = PRODUCTS[0];

function Home() {
  return (
    <>
      <section className="home-v90-hero" aria-labelledby="home-v90-title">
        <div className="v90-hero-glow" aria-hidden="true" />
        <div className="site-frame v90-hero-grid">
          <div className="v90-hero-copy">
            <div className="v90-kicker"><span>PREMIUM INDIAN SPICE</span><i /></div>
            <h1 id="home-v90-title">
              <span>SARKSH Foods</span>
              <strong>Red Chilli Powder, made to stand out.</strong>
            </h1>
            <p className="v90-hero-lead">
              Rich colour, bold flavour and a premium 1 kg pack created for everyday cooking,
              professional kitchens and modern retail.
            </p>

            <div className="v90-hero-actions">
              <BookProductButton product={product} className="v90-button v90-button--solid" label="Order Chilli Powder" />
              <Link to="/enterprise" className="v90-button v90-button--outline">
                Business Orders <ArrowRight size={17} />
              </Link>
            </div>

            <div className="v90-hero-assurance" aria-label="Product highlights">
              <span><Leaf size={18} /><b>100% Pure &amp; Natural</b></span>
              <span><ShieldCheck size={18} /><b>FSSAI Registered</b></span>
              <span><Truck size={18} /><b>Orders Across India</b></span>
            </div>
          </div>

          <div className="v90-product-stage" aria-label="SARKSH Foods Chilli Powder 1 kg product presentation">
            <div className="v90-product-photo">
              <img
                src="/assets/sarksh-foods-chilli-powder-og.jpg"
                alt="SARKSH Foods Chilli Powder 1 kg carton with red chillies and ground chilli powder"
                fetchPriority="high"
                decoding="async"
              />
              <div className="v90-product-photo-shade" aria-hidden="true" />
              <div className="v90-photo-label"><span>1 KG</span><strong>CHILLI POWDER</strong></div>
            </div>

            <div className="v90-product-tiles">
              <article>
                <span>01</span>
                <strong>Rich Colour</strong>
                <p>A confident red for everyday Indian cooking.</p>
              </article>
              <article>
                <span>02</span>
                <strong>Bold Flavour</strong>
                <p>Made for dishes that need presence and depth.</p>
              </article>
              <article>
                <span>03</span>
                <strong>Premium Pack</strong>
                <p>A 1 kg carton designed for shelf recognition.</p>
              </article>
            </div>
          </div>
        </div>

        <div className="v90-proof-rail">
          <div className="site-frame v90-proof-rail-grid">
            <span><Leaf size={22} /><b>Pure &amp; Natural</b><small>Simple product promise</small></span>
            <i />
            <span><PackageCheck size={22} /><b>1 kg Carton</b><small>Current pack size</small></span>
            <i />
            <span><UtensilsCrossed size={22} /><b>Home &amp; Food Service</b><small>Made for everyday use</small></span>
            <i />
            <span><Truck size={22} /><b>Pan-India Orders</b><small>Home and business enquiries</small></span>
          </div>
        </div>
      </section>

      <section className="v90-product-section section-pad">
        <div className="site-frame v90-product-section-grid">
          <div className="v90-pack-display">
            <div className="v90-pack-halo" aria-hidden="true" />
            <img src="/assets/chilli-pack-front.webp" alt="SARKSH Foods Chilli Powder 1 kg carton" loading="lazy" />
            <div className="v90-pack-caption"><span>THE CURRENT RANGE</span><strong>Premium Red Chilli Powder · 1 kg</strong></div>
          </div>

          <div className="v90-section-copy">
            <span className="v90-section-kicker">A KITCHEN ESSENTIAL, ELEVATED</span>
            <h2>Premium on the shelf. Familiar in the kitchen.</h2>
            <p className="v90-section-lead">
              SARKSH Foods Chilli Powder brings a strong brand presence to a product used every day.
              The pack is easy to recognise, the product story is easy to understand, and ordering stays simple.
            </p>
            <div className="v90-check-grid">
              <span><Check size={17} /> 100% Pure &amp; Natural</span>
              <span><Check size={17} /> Rich Colour. Bold Flavour.</span>
              <span><Check size={17} /> No Added Preservatives</span>
              <span><Check size={17} /> 1 kg Premium Carton</span>
            </div>
            <div className="v90-inline-actions">
              <BookProductButton product={product} className="v90-button v90-button--light" label="Order 1 kg Carton" />
              <Link to="/chilli-powder" className="v90-text-link">View product details <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="v90-occasion-section section-pad">
        <div className="site-frame">
          <div className="v90-section-heading">
            <div><span className="v90-section-kicker">MADE FOR THE WAY INDIA COOKS</span><h2>One product. Many kitchens.</h2></div>
            <p>From everyday meals to professional food preparation, choose the ordering option that fits your requirement.</p>
          </div>

          <div className="v90-occasion-grid">
            <article>
              <ShoppingBag size={26} />
              <span>HOME</span>
              <h3>Everyday cooking</h3>
              <p>Order the current 1 kg carton for regular household use.</p>
              <BookProductButton product={product} className="v90-card-link" label="Order for home" />
            </article>
            <article>
              <UtensilsCrossed size={26} />
              <span>FOOD SERVICE</span>
              <h3>Professional kitchens</h3>
              <p>Share requirements for restaurants, caterers, hotels and institutions.</p>
              <Link to="/enterprise" className="v90-card-link">Business orders <ArrowRight size={15} /></Link>
            </article>
            <article>
              <Store size={26} />
              <span>TRADE</span>
              <h3>Retail &amp; wholesale</h3>
              <p>Connect with us for store, resale, wholesale and distribution requirements.</p>
              <Link to="/enterprise" className="v90-card-link">Trade enquiries <ArrowRight size={15} /></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="v90-brand-section section-pad">
        <div className="site-frame v90-brand-grid">
          <div className="v90-brand-mark"><img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" /></div>
          <div className="v90-brand-copy">
            <span className="v90-section-kicker">LEGACY OF ELEGANCE</span>
            <h2>A food brand built to be recognised.</h2>
            <p>
              SARKSH Foods combines a distinctive Indian identity with clear, modern presentation.
              The temple, palms and deep maroon signature carry from the pack to every customer touchpoint.
            </p>
            <Link to="/about" className="v90-text-link">Discover SARKSH Foods <ArrowRight size={16} /></Link>
          </div>
          <div className="v90-brand-stats">
            <div><strong>1 kg</strong><span>Current pack</span></div>
            <div><strong>India</strong><span>Order coverage</span></div>
            <div><strong>FSSAI</strong><span>Registered</span></div>
          </div>
        </div>
      </section>

      <section className="v90-final-cta">
        <div className="site-frame v90-final-cta-inner">
          <div><span>READY TO ORDER?</span><h2>Bring SARKSH Foods to your kitchen or business.</h2></div>
          <div className="v90-final-actions">
            <BookProductButton product={product} className="v90-button v90-button--solid" label="Order Chilli Powder" />
            <Link to="/enterprise" className="v90-button v90-button--outline">Business Orders <Building2 size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
