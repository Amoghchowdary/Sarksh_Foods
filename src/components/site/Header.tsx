import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { PRODUCTS } from "@/lib/products";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/enterprise", label: "Business Orders" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}${open ? " site-header--open" : ""}`}>
      <div className="site-frame header-inner">
        <Link to="/" aria-label="SARKSH Foods home" className="header-brand">
          <img src="/assets/logos/sarksh-foods-logo.svg" alt="" />
          <span className="header-brand-copy">
            <strong>SARKSH FOODS</strong>
            <small>Legacy of Elegance</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="nav-link"
              activeProps={{ className: "nav-link nav-link--active" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/account" className="header-account-link" aria-label="Customer account"><UserRound size={18} /><span>Account</span></Link>
          <BookProductButton product={PRODUCTS[0]} className="header-book-button" label="Order now" />
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-menu">
          <nav className="site-frame" aria-label="Mobile navigation">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="mobile-nav-link" activeProps={{ className: "mobile-nav-link mobile-nav-link--active" }}>
                {item.label}
              </Link>
            ))}
            <Link to="/account" className="mobile-nav-link"><UserRound size={17} /> Customer account</Link>
            <BookProductButton product={PRODUCTS[0]} className="button-primary mobile-book-button" label="Order Chilli Powder" />
            <span className="mobile-menu-note"><ShoppingBag size={15} /> 1 kg carton · Home & business orders</span>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
