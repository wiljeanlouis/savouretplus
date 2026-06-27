import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { CartDrawer } from "./components/cart/CartDrawer";
import { DecorationCatalogPage, TastingCatalogPage } from "./components/catalog/CatalogPage";
import { ContactPage } from "./components/contact/ContactPage";
import { HomePage } from "./components/home/HomePage";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { QuotePage } from "./components/quote/QuotePage";
import { useCart } from "./application/cart/useCart";
import { configureCommerceGateway } from "./application/commerce";
import { createCommerceGateway } from "./infrastructure/createCommerceGateway";

configureCommerceGateway(createCommerceGateway());

const pages = {
  accueil: HomePage,
  decoration: DecorationCatalogPage,
  degustation: TastingCatalogPage,
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
