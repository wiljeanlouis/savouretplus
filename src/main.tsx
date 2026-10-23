import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { CartPage } from "./components/cart/CartPage";
import { DecorationCatalogPage } from "./components/catalog/page/DecorationCatalogPage";
import { DecorationDetailPage } from "./components/catalog/page/DecorationDetailPage";
import { TastingCatalogPage } from "./components/catalog/page/TastingCatalogPage";
import { ContactPage } from "./components/contact/ContactPage";
import { HomePage } from "./components/home/HomePage";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { QuotePage } from "./components/quote/QuotePage";
import { useCart } from "./application/cart/useCart";
import { configureCommerceGateway } from "./application/commerce";
import { createCommerceGateway } from "./infrastructure/createCommerceGateway";
import { parseAppHash } from "./domain/navigation";

configureCommerceGateway(createCommerceGateway());

const pages = {
  accueil: HomePage,
  decoration: DecorationCatalogPage,
  "decoration-detail": DecorationDetailPage,
  degustation: TastingCatalogPage,
  panier: CartPage,
  soumission: QuotePage,
  contact: ContactPage,
};

function getLocationState() {
  return parseAppHash(window.location.hash);
}

function App() {
  const [location, setLocation] = useState(getLocationState);
  const { route, section, decorationSlug } = location;
  const cart = useCart();
  const Page = useMemo(() => pages[route] || HomePage, [route]);

  useEffect(() => {
    const onHashChange = () => setLocation(getLocationState());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!section) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, section]);

  return (
    <div className="min-h-svh">
      <Header activeRoute={route === "decoration-detail" ? "decoration" : route} cartCount={cart.count} />
      <main>
        <Page cart={cart} slug={decorationSlug} />
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
