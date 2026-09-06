import { describe, expect, it } from "vitest";
import {
  isIsoDate,
  isUuid,
  isValidDateRange,
  readFollowUpPreset,
  readInsuranceFilter,
  readModelFilter,
  readStatusFilter,
} from "@/lib/validation";

describe("server input validation", () => {
  it("rejects malformed and impossible dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("06-09-2026")).toBe(false);
  });

  it("requires insurance expiry on or after its start date", () => {
    expect(isValidDateRange("2026-09-06", "2027-09-05")).toBe(true);
    expect(isValidDateRange("2027-09-05", "2026-09-06")).toBe(false);
  });

  it("accepts only supported follow-up presets", () => {
    expect(readFollowUpPreset("3")).toBe("3");
    expect(readFollowUpPreset("custom")).toBe("custom");
    expect(readFollowUpPreset("NaN")).toBeNull();
  });

  it("validates customer identifiers", () => {
    expect(isUuid("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
    expect(isUuid("demo-ahmad")).toBe(false);
  });

  it("falls back safely for manipulated list filters", () => {
    expect(readModelFilter("x50")).toBe("x50");
    expect(readModelFilter("invalid")).toBe("all");
    expect(readStatusFilter("invalid")).toBe("all");
    expect(readInsuranceFilter("invalid")).toBe("all");
  });
});
