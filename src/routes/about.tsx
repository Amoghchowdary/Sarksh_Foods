import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="site-frame about-hero-grid">
          <div className="about-hero-copy page-title-card"><span className="eyebrow eyebrow--gold">OUR STORY</span><h1>A food brand shaped by <em>heritage, recognition and ambition.</em></h1><p>SARKSH Foods begins with chilli powder and a brand language designed to remain recognisable as the range grows.</p><Link to="/chilli-powder" className="button-primary">Explore Chilli Powder <ArrowUpRight size={17} /></Link></div>
          <div className="about-logo-stage"><img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" /></div>
        </div>
      </section>

      <section className="about-story section-pad">
        <div className="site-frame about-story-grid">
          <div className="about-story-image"><img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt="SARKSH Foods Chilli Powder brand presentation" loading="lazy" /></div>
          <div className="about-story-copy"><span className="eyebrow">LEGACY OF ELEGANCE</span><h2>Recognisable on the pack. Consistent across the brand.</h2><p>The temple, palms, deep maroon and warm gold are the visual signature of SARKSH Foods. They connect the product pack, digital experience and future brand touchpoints.</p><p>Chilli Powder is the first product chapter. The commercial system is being built so new categories can join the same brand family without losing recognition.</p></div>
        </div>
      </section>

      <section className="brand-principles section-pad"><div className="site-frame"><div className="section-heading-row"><div><span className="eyebrow">WHAT SARKSH STANDS FOR</span><h2>Clear product. Strong identity. Easy buying.</h2></div><p>The brand experience is deliberately simple: make the product easy to recognise, easy to understand and easy to order.</p></div><div className="principle-grid"><article><span>01</span><h3>Recognition</h3><p>A consistent visual identity across product, website and future retail presence.</p></article><article><span>02</span><h3>Relevance</h3><p>A product rooted in everyday cooking and professional food preparation.</p></article><article><span>03</span><h3>Commerce</h3><p>Direct routes for household orders and larger business requirements.</p></article></div></div></section>
    </>
  );
}
