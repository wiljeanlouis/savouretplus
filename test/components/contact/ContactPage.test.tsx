import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactPage } from "../../../src/components/contact/ContactPage";

describe("Contact page", () => {
  it("presents the C2 editorial introduction without a background photograph", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain("Nous contacter");
    expect(html).toContain("Une question, un projet ou une occasion à célébrer ?");
    expect(html).toContain("py-9 text-center sm:py-10 lg:py-11");
    expect(html).toContain("relative mx-auto h-7 w-7");
    expect(html).not.toContain("breadcrumbs-bg-nous-contacter.png");
  });

  it("keeps every existing contact destination accessible", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain('href="tel:+14389691433"');
    expect(html).toContain('href="tel:+15146042246"');
    expect(html).toContain('href="mailto:savouretplus@gmail.com"');
    expect(html).toContain('href="https://youtube.com/@SavourEtplus"');
  });

  it("links the event callout to the quote route", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain("Vous préparez un événement ?");
    expect(html).toContain("Présentez-nous votre projet pour recevoir une proposition adaptée.");
    expect(html).toContain("Demander une soumission");
    expect(html).toContain('href="#/soumission"');
  });
});
