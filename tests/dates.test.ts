import { describe, expect, it } from "vitest";
import { addDaysInKL, daysUntilInKL, todayInKL } from "@/lib/dates";
import { resolveFollowUp } from "@/lib/follow-up";

const mondayKL = new Date("2026-09-07T10:00:00+08:00");

describe("Malaysia date helpers", () => {
  it("returns today's date in Asia/Kuala_Lumpur", () => {
    expect(todayInKL(mondayKL)).toBe("2026-09-07");
  });

  it("adds 3 days for a follow-up preset from today", () => {
    expect(addDaysInKL(3, mondayKL)).toBe("2026-09-10");
    expect(resolveFollowUp("3", null, mondayKL)).toEqual({
      enabled: true,
      nextFollowUpAt: "2026-09-10",
    });
  });

  it("does not use sale date + 365 for insurance remaining days", () => {
    expect(daysUntilInKL("2026-10-07", mondayKL)).toBe(30);
    expect(daysUntilInKL("2026-09-14", mondayKL)).toBe(7);
    expect(daysUntilInKL("2026-09-07", mondayKL)).toBe(0);
    expect(daysUntilInKL("2026-09-06", mondayKL)).toBe(-1);
  });
});
