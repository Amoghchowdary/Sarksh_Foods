import { ShoppingBag } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import type { Product } from "@/lib/products";

const loadBookingDialog = () => import("./BookingDialog");
const LazyBookingDialog = lazy(() => loadBookingDialog().then((module) => ({ default: module.BookingDialog })));

export function ProductBookingModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <LazyBookingDialog product={product} onClose={onClose} />
    </Suspense>
  );
}

export function BookProductButton({ product, className = "button-primary", label = "Order now" }: { product: Product; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const warmDialog = () => { void loadBookingDialog(); };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        onPointerEnter={warmDialog}
        onFocus={warmDialog}
      >
        <ShoppingBag size={17} /> {label}
      </button>
      <ProductBookingModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
