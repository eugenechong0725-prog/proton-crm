import { describe, expect, it } from "vitest";
import { followUpBucket, resolveFollowUp } from "@/lib/follow-up";

const today = new Date("2026-09-07T09:00:00+08:00");

describe("follow-up scheduling", () => {
  it("sets a 3-day follow-up from today in Malaysia time", () => {
    expect(resolveFollowUp("3", null, today)).toEqual({
      enabled: true,
      nextFollowUpAt: "2026-09-10",
    });
  });

  it("puts today's date on the dashboard today list", () => {
    expect(followUpBucket("2026-09-07", true, today)).toBe("today");
  });

  it("marks earlier dates overdue and later dates upcoming", () => {
    expect(followUpBucket("2026-09-06", true, today)).toBe("overdue");
    expect(followUpBucket("2026-09-10", true, today)).toBe("upcoming");
    expect(followUpBucket("2026-09-07", false, today)).toBeNull();
  });

  it("clears follow-up when none is selected", () => {
    expect(resolveFollowUp("none", "2026-09-20", today)).toEqual({
      enabled: false,
      nextFollowUpAt: null,
    });
  });
});
