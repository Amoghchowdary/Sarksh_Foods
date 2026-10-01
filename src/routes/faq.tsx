import "../commercial-v14-seo.css";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/seoDatabase";

export const Route = createFileRoute("/faq")({ component: FaqPage });

function FaqPage() {
  return (
    <>
      <section className="v14-content-hero">
        <div className="site-frame v14-content-hero-inner">
          <span className="eyebrow">SARKSH FOODS · FAQ</span>
          <h1>Chilli Powder Questions, Answered Clearly.</h1>
          <p>Product, pack, order and supply information in one place. These answers are written for people first and kept consistent with the product information published elsewhere on the site.</p>
        </div>
      </section>

      <section className="v14-content-page section-pad">
        <div className="site-frame v14-content-grid">
          <div className="v14-content-main">
            <div className="v14-faq-list">
              {FAQ_ITEMS.map((item) => (
                <article className="v14-faq-card" key={item.id} id={item.id}>
                  <div className="v14-faq-icon"><HelpCircle size={20} /></div>
                  <div>
                    <h2>{item.question}</h2>
                    <p>{item.answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside className="v14-content-aside">
            <span className="eyebrow">NEXT</span>
            <h3>Compare before you choose.</h3>
            <p>Use our practical checklist for comparing chilli powder brands in India without relying on unsupported “best” claims.</p>
            <Link to="/chilli-powder-brands-india" className="text-link">Open comparison guide <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}
