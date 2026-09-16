import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Building2, Check, Hotel, Landmark, Store, Truck, Warehouse } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/enterprise")({ component: EnterprisePage });
const product = PRODUCTS[0];

const buyers = [
  [Store, "Retail stores", "Shelf and resale requirements."],
  [Warehouse, "Wholesalers", "Larger trade quantities."],
  [Truck, "Distributors", "Market and distribution requirements."],
  [Hotel, "Hotels & restaurants", "Professional kitchen requirements."],
  [Building2, "Caterers", "Event and catering requirements."],
  [Landmark, "Institutions", "Organised kitchen requirements."],
] as const;

function EnterprisePage() {
  return (
    <>
      <section className="enterprise-hero">
        <div className="site-frame enterprise-hero-grid">
          <div className="enterprise-hero-copy">
            <span className="eyebrow eyebrow--gold">SARKSH FOODS BUSINESS</span>
            <h1>One product.<br /><em>Built for bigger orders.</em></h1>
            <p>Retail, wholesale, distribution, HoReCa and institutional buyers can submit quantity and delivery requirements through one clear order route.</p>
            <div className="hero-actions"><BookProductButton product={product} label="Start business order" /><Link to="/contact" className="button-light">Talk to us <ArrowUpRight size={17} /></Link></div>
            <div className="enterprise-assurance"><span><Check size={15} /> Buyer type</span><span><Check size={15} /> Quantity</span><span><Check size={15} /> Delivery location</span><span><Check size={15} /> Order reference</span></div>
          </div>
          <div className="enterprise-pack"><img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt="SARKSH Foods Chilli Powder 1 kg carton for business buyers" /></div>
        </div>
      </section>

      <section className="enterprise-buyers section-pad">
        <div className="site-frame">
          <div className="section-heading-row"><div><span className="eyebrow">WHO WE SERVE</span><h2>A clear route for every commercial buyer.</h2></div><p>Select the buyer type closest to your requirement, then share quantity and delivery details to start the conversation.</p></div>
          <div className="enterprise-buyer-grid">
            {buyers.map(([Icon, title, copy]) => <article key={title}><Icon size={24} /><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="enterprise-flow section-pad">
        <div className="site-frame enterprise-flow-grid">
          <div><span className="eyebrow eyebrow--gold">BUSINESS ORDER FLOW</span><h2>From requirement to order reference in three steps.</h2><p>The website captures the first commercial requirement cleanly. Pricing, stock, payment and final delivery can then be confirmed with the buyer.</p></div>
          <ol>
            <li><span>01</span><div><h3>Choose buyer type</h3><p>Retail, wholesale, distribution, food service or institution.</p></div></li>
            <li><span>02</span><div><h3>Enter quantity &amp; destination</h3><p>Share the number of cartons and delivery location.</p></div></li>
            <li><span>03</span><div><h3>Receive a reference</h3><p>The order request is recorded and a reference is generated for follow-up.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="enterprise-bottom-cta"><div className="site-frame"><div><span className="eyebrow">READY FOR A BUSINESS ORDER?</span><h2>Tell us the quantity. We’ll take it from there.</h2></div><BookProductButton product={product} label="Start business order" /></div></section>
    </>
  );
}
