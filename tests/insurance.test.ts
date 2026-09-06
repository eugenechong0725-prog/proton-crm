import { describe, expect, it } from "vitest";
import {
  canShowInsurance,
  insuranceBucket,
  insuranceStage,
  matchesInsuranceFilter,
} from "@/lib/insurance";

const today = new Date("2026-09-07T09:00:00+08:00");

describe("insurance renewal logic", () => {
  it("only includes sold customers", () => {
    expect(canShowInsurance("sold")).toBe(true);
    expect(canShowInsurance("new_lead")).toBe(false);
    expect(canShowInsurance("follow_up")).toBe(false);
    expect(canShowInsurance("not_interested")).toBe(false);
    expect(canShowInsurance("sold", "2026-09-01T00:00:00Z")).toBe(false);
  });

  it("uses the official expiry date, not sale date + 365", () => {
    expect(insuranceBucket("2026-10-07", today)).toBe("due_30");
    expect(insuranceStage("2026-10-07", today)).toBe("upcoming");
    expect(insuranceBucket("2026-09-14", today)).toBe("due_7");
    expect(insuranceStage("2026-09-14", today)).toBe("urgent");
    expect(insuranceBucket("2026-09-07", today)).toBe("today");
    expect(insuranceBucket("2026-09-01", today)).toBe("overdue");
  });

  it("keeps dashboard buckets exclusive", () => {
    expect(insuranceBucket("2026-09-21", today)).toBe("due_14");
    expect(insuranceBucket("2026-09-22", today)).toBe("due_30");
    expect(insuranceBucket("2026-10-08", today)).toBeNull();
  });

  it("treats filters as inclusive windows", () => {
    expect(matchesInsuranceFilter("2026-09-14", "due_30", today)).toBe(true);
    expect(matchesInsuranceFilter("2026-09-14", "due_7", today)).toBe(true);
    expect(matchesInsuranceFilter("2026-09-07", "due_7", today)).toBe(false);
    expect(matchesInsuranceFilter("2026-09-07", "today", today)).toBe(true);
  });
});
