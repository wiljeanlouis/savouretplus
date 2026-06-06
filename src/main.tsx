import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { CatalogPage } from "./components/CatalogPage";
import { QuotePage } from "./components/QuotePage";
import { ContactPage } from "./components/ContactPage";
import { CartDrawer } from "./components/CartDrawer";
import { useCart } from "./lib/useCart";

const pages = {
  accueil: HomePage,
  degustation: CatalogPage,
  soumission: QuotePage,
  contact: ContactPage,
};

function normalizeRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const route = hash.split("?")[0];
  return pages[route] ? route : "accueil";
}

function App() {
  const [route, setRoute] = useState(normalizeRoute);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const Page = useMemo(() => pages[route] || HomePage, [route]);

  useEffect(() => {
    const onHashChange = () => setRoute(normalizeRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-svh">
      <Header activeRoute={route} cartCount={cart.count} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Page cart={cart} onCartOpen={() => setCartOpen(true)} />
      </main>
      <Footer />
      <CartDrawer cart={cart} open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
