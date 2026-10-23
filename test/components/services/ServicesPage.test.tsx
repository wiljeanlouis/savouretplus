import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CombinedServicesCallout,
  OrganisationServiceVisual,
  ServicesHero,
  ServicesPage,
} from "../../../src/components/services/ServicesPage";
import { Footer } from "../../../src/components/layout/Footer";

describe("UI-2.3 services page", () => {
  it("presents the three activities and their dedicated commercial routes", () => {
    const html = renderToStaticMarkup(<ServicesPage />);

    expect(html).toContain("Décoration événementielle");
    expect(html).toContain("Dégustation et service traiteur");
    expect(html).toContain("Organisation d&#x27;événements");
    expect(html).toContain('href="#/decoration"');
    expect(html).toContain('href="#/degustation"');
    expect(html).toContain("#/soumission?service=decoration");
    expect(html).toContain("#/soumission?service=traiteur");
    expect(html).toContain("#/soumission?service=organisation");
    expect(html).toContain("services-traiteur-plateaux.jpg");
    expect(html).toContain("aspect-[5/4]");
    expect(html).toContain("services-decoration-ambiance.jpg");
    expect(html).toContain("aspect-[4/5]");
    expect(html).toContain("Photographie d&#x27;ambiance");
    expect(html).not.toContain("decoration-1-530x480.png");
    expect(html).not.toContain("decoration-3-530x480.png");
  });

  it("uses one local event photograph in the hero without repeating section images", () => {
    const html = renderToStaticMarkup(<ServicesHero />);

    expect(html).toContain("Chaque célébration mérite une attention particulière.");
    expect(html).toContain('href="#/soumission"');
    expect(html).toContain("ambient-elegant-reception.jpg");
    expect(html.match(/<img/g) || []).toHaveLength(1);
    expect(html).not.toContain("decoration-1-530x480.png");
    expect(html).not.toContain("services-traiteur-plateaux.jpg");
    expect(html).not.toContain("https://");
  });

  it("replaces the organization photograph with three descriptive dimensions", () => {
    const html = renderToStaticMarkup(<OrganisationServiceVisual />);

    expect(html).toContain("Préparation");
    expect(html).toContain("Coordination");
    expect(html).toContain("Personnalisation");
    expect(html).toContain("Dimensions de l&#x27;accompagnement");
    expect(html).not.toContain("<img");
  });

  it("offers decoration and catering together without organization", () => {
    const html = renderToStaticMarkup(<CombinedServicesCallout />);

    expect(html).toContain("#/soumission?service=traiteur-decoration");
    expect(html).not.toContain("traiteur-decoration-organisation");
  });

  it("links the footer service discovery entry to the editorial page", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('href="#/services"');
    expect(html).toContain("Nos services");
  });
});
