import { describe, expect, it } from "vitest";
import { normalizeMalaysiaPhone, whatsappUrl } from "@/lib/phone";

describe("Malaysia phone normalization", () => {
  it("converts 0162246868 to 60162246868", () => {
    expect(normalizeMalaysiaPhone("0162246868")).toBe("60162246868");
  });

  it("accepts formatted and international numbers", () => {
    expect(normalizeMalaysiaPhone("+60 16-224 6868")).toBe("60162246868");
    expect(normalizeMalaysiaPhone("60162246868")).toBe("60162246868");
    expect(normalizeMalaysiaPhone("162246868")).toBe("60162246868");
  });

  it("builds a wa.me link", () => {
    expect(whatsappUrl("0162246868")).toBe("https://wa.me/60162246868");
  });

  it("rejects non-mobile and invalid-length numbers", () => {
    expect(normalizeMalaysiaPhone("60312345678")).toBeNull();
    expect(normalizeMalaysiaPhone("6011234567890")).toBeNull();
    expect(normalizeMalaysiaPhone("1234")).toBeNull();
  });
});
