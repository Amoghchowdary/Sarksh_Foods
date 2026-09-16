import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BookProductButton } from "@/components/site/ProductBookingModal";
import { getProduct } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);
  if (!product) return <section className="not-found"><div className="site-frame"><span className="eyebrow">SARKSH Foods</span><h1>Product not found.</h1><Link to="/products" className="button-primary">Back to products</Link></div></section>;

  return (
    <>
      <section className="product-detail-hero">
        <div className="site-frame product-detail-grid">
          <div className="product-detail-media">
            <Link to="/products" className="back-link"><ArrowLeft size={15} /> All products</Link>
            <img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt={`${product.name} ${product.weight}`} />
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">{product.eyebrow}</span>
            <h1>{product.name}</h1>
            <p className="product-detail-tagline">{product.tagline}</p>
            <p>{product.description}</p>
            <div className="detail-specs">
              <div><span>Pack size</span><strong>{product.weight}</strong></div>
              <div><span>Category</span><strong>{product.category}</strong></div>
              <div><span>Ordering</span><strong>Home &amp; Business</strong></div>
            </div>
            <ul className="check-list"><li><Check size={17} /> 100% Pure &amp; Natural — on-pack highlight</li><li><Check size={17} /> Rich Colour · Bold Flavour — on-pack highlight</li><li><Check size={17} /> No Added Preservatives — on-pack highlight</li></ul>
            <div className="inline-actions"><BookProductButton product={product} label="Order 1 kg carton" /><Link to="/enterprise" className="text-link">Business quantity <ArrowRight size={16} /></Link></div>
          </div>
        </div>
      </section>
      <section className="product-story section-pad"><div className="site-frame product-story-grid"><div><span className="eyebrow">THE PACK</span><h2>Premium on the shelf. Familiar in the kitchen.</h2></div><p>The SARKSH Foods pack brings the brand’s temple, maroon and gold identity directly into the product experience, creating a distinctive visual presence without losing the simplicity of an everyday spice.</p></div></section>
    </>
  );
}
