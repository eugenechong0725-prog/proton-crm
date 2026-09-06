import { describe, expect, it } from "vitest";
import { demoInsertCustomer, listDemoCustomers } from "@/lib/demo/store";

describe("demo session isolation", () => {
  it("does not share edits between browser sessions", () => {
    const sessionA = "test-session-a";
    const sessionB = "test-session-b";

    demoInsertCustomer(sessionA, {
      name: "Session A only",
      phone: "60162246868",
      proton_model: "saga",
      customer_status: "new_lead",
      next_follow_up_at: null,
      follow_up_enabled: false,
      latest_remark: null,
      archived_at: null,
    });

    expect(listDemoCustomers(sessionA, { query: "Session A only" })).toHaveLength(1);
    expect(listDemoCustomers(sessionB, { query: "Session A only" })).toHaveLength(0);
  });
});
