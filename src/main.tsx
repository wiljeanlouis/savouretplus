import React, { useMemo } from "react";
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
import { RealisationDetailPage } from "./components/realisations/RealisationDetailPage";
import { RealisationsPage } from "./components/realisations/RealisationsPage";
import { ServicesPage } from "./components/services/ServicesPage";
import { useCart } from "./application/cart/useCart";
import { configureCommerceGateway } from "./application/commerce";
import { createCommerceGateway } from "./infrastructure/createCommerceGateway";
import {
  useHashNavigation,
  useNavigationScroll,
} from "./application/navigation/useHashNavigation";

configureCommerceGateway(createCommerceGateway());

const pages = {
  accueil: HomePage,
  decoration: DecorationCatalogPage,
  "decoration-detail": DecorationDetailPage,
  degustation: TastingCatalogPage,
  services: ServicesPage,
  realisations: RealisationsPage,
  "realisation-detail": RealisationDetailPage,
  panier: CartPage,
  soumission: QuotePage,
  contact: ContactPage,
};

function App() {
  const navigation = useHashNavigation();
  const { route, decorationSlug, realisationSlug } = navigation.location;
  const cart = useCart();
  const Page = useMemo(() => pages[route] || HomePage, [route]);
  useNavigationScroll(navigation);

  return (
    <div className="min-h-svh">
      <Header
        activeRoute={
          route === "decoration-detail"
            ? "decoration"
            : route === "realisation-detail"
              ? "realisations"
              : route
        }
        cartCount={cart.count}
      />
      <main>
        <Page
          cart={cart}
          slug={route === "realisation-detail" ? realisationSlug : decorationSlug}
        />
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
