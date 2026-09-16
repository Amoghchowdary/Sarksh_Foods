import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-frame footer-top">
        <div className="footer-brand-block">
          <img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" />
          <div>
            <strong>SARKSH FOODS</strong>
            <p>Chilli powder for home, trade and professional kitchens.</p>
          </div>
        </div>
        <BookProductButton product={PRODUCTS[0]} className="button-gold" label="Order Chilli Powder" />
      </div>
      <div className="site-frame footer-main">
        <div className="footer-column">
          <span>Shop</span>
          <Link to="/chilli-powder">Chilli Powder</Link>
          <Link to="/pan-india">Pan-India Supply</Link>
        </div>
        <div className="footer-column">
          <span>Business</span>
          <Link to="/enterprise">Retail & Wholesale</Link>
          <Link to="/enterprise">Distribution & HoReCa</Link>
        </div>
        <div className="footer-column">
          <span>Company</span>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        <div className="footer-cta">
          <span>Need a commercial quantity?</span>
          <h3>Tell us what you need.</h3>
          <Link to="/enterprise" className="footer-enquire">Open business orders <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="site-frame">
          <span>© {new Date().getFullYear()} SARKSH Foods</span>
          <span>FSSAI Reg. No. 23626023001557</span>
          <span>Legacy of Elegance</span>
        </div>
      </div>
    </footer>
  );
}
