import { describe, expect, it } from "vitest";
import { formatCurrency } from "../../src/shared/format";

describe("formatCurrency", () => {
  it("formats cents as Canadian dollars for fr-CA", () => {
    const formatted = formatCurrency(1234);

    expect(formatted).toContain("12,34");
    expect(formatted).toContain("$");
  });

  it("treats missing cents as zero", () => {
    expect(formatCurrency()).toContain("0,00");
  });
});
