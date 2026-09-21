import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Check, PackageCheck, ShoppingBag, Store } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/products")({ component: ProductsPage });

function ProductsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname !== "/products" && pathname !== "/products/") return <Outlet />;
  const product = PRODUCTS[0];

  return (
    <>
      <section className="catalog-hero">
        <div className="site-frame catalog-hero-grid">
          <div className="catalog-hero-copy">
            <span className="eyebrow">SARKSH FOODS · CURRENT RANGE</span>
            <h1>Chilli Powder.<br /><em>Made to stand out.</em></h1>
            <p>Our current range begins with a 1 kg premium chilli powder carton for household, retail, wholesale and professional-kitchen requirements across India.</p>
            <div className="hero-actions"><BookProductButton product={product} label="Order 1 kg carton" /><Link to="/enterprise" className="button-secondary">Business orders <ArrowRight size={16} /></Link></div>
          </div>
          <div className="catalog-hero-media"><img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt="SARKSH Foods Chilli Powder 1 kg carton" /></div>
        </div>
      </section>

      <section className="catalog-product section-pad">
        <div className="site-frame catalog-product-grid">
          <div className="catalog-pack"><img src="/assets/chilli-pack-front.webp" alt="Front of SARKSH Foods Chilli Powder 1 kg carton" loading="lazy" /></div>
          <div className="catalog-copy">
            <span className="eyebrow">GROUND SPICE · 1 KG</span>
            <h2>Chilli Powder</h2>
            <p className="section-lead">Bold colour. Full flavour. Distinctly SARKSH.</p>
            <p>A premium pack for everyday cooking, retail shelves and professional kitchens, with separate order routes for home and business buyers.</p>
            <ul className="check-list"><li><Check size={17} /> 1 kg carton</li><li><Check size={17} /> Home order requests</li><li><Check size={17} /> Retail, wholesale, HoReCa and distribution enquiries</li></ul>
            <div className="inline-actions"><BookProductButton product={product} label="Order Chilli Powder" /><Link to="/chilli-powder" className="text-link">Chilli Powder details <ArrowRight size={16} /></Link></div>
          </div>
        </div>
      </section>

      <section className="order-options section-pad">
        <div className="site-frame">
          <div className="section-heading-row"><div><span className="eyebrow">HOW TO BUY</span><h2>Choose the ordering option that fits your need.</h2></div><p>Order for home use, or choose Business Orders for retail, food service, distribution and institutional requirements.</p></div>
          <div className="order-option-grid">
            <article><ShoppingBag size={25} /><h3>Home orders</h3><p>Order the current 1 kg carton for household use.</p><BookProductButton product={product} className="text-button" label="Order for home" /></article>
            <article><Store size={25} /><h3>Retail &amp; wholesale</h3><p>Share quantity and delivery location for store or trade requirements.</p><Link to="/enterprise" className="text-button">Open business orders <ArrowRight size={15} /></Link></article>
            <article><PackageCheck size={25} /><h3>HoReCa &amp; institutions</h3><p>Share requirements for professional kitchens and institutions.</p><Link to="/enterprise" className="text-button">Share requirement <ArrowRight size={15} /></Link></article>
          </div>
        </div>
      </section>
    </>
  );
}
