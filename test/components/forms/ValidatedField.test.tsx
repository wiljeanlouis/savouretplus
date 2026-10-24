import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ValidatedField } from "../../../src/components/forms/ValidatedField";

describe("ValidatedField", () => {
  it("associates a visible error with its invalid control", () => {
    const html = renderToStaticMarkup(
      <ValidatedField id="customer-phone" label="Téléphone" error="Téléphone invalide">
        <input type="tel" />
      </ValidatedField>,
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="customer-phone-error"');
    expect(html).toContain('id="customer-phone-error"');
    expect(html).toContain("Téléphone invalide");
  });

  it("removes the error association once the value is corrected", () => {
    const html = renderToStaticMarkup(
      <ValidatedField id="customer-phone" label="Téléphone">
        <input type="tel" />
      </ValidatedField>,
    );

    expect(html).toContain('aria-invalid="false"');
    expect(html).not.toContain("customer-phone-error");
  });

  it("associates a formatted value hint with the control", () => {
    const html = renderToStaticMarkup(
      <ValidatedField
        id="event-date"
        label="Date"
        hint="Date sélectionnée : 12 juin 2027"
      >
        <input type="date" />
      </ValidatedField>,
    );

    expect(html).toContain('aria-describedby="event-date-hint"');
    expect(html).toContain("Date sélectionnée : 12 juin 2027");
  });
});
