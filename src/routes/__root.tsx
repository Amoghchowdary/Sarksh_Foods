import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BrandIntro } from "@/components/site/BrandIntro";
import { SeoSync } from "@/components/site/SeoSync";

function NotFound() {
  return (
    <section className="not-found">
      <div className="site-frame">
        <span className="eyebrow">SARKSH Foods</span>
        <h1>404</h1>
        <p>The requested page is not on this table.</p>
        <Link to="/" className="button-primary">Return home</Link>
      </div>
    </section>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const adminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const accountRoute = pathname === "/account" || pathname.startsWith("/account/");

  if (adminRoute || accountRoute) {
    return (
      <>
        <SeoSync />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <SeoSync />
      <BrandIntro />
      <div className="sarksh-site-shell">
        <Header />
        <main><Outlet /></main>
        <Footer />
      </div>
    </>
  );
}
