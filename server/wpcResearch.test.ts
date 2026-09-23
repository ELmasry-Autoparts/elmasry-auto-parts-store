import { describe, expect, it } from "vitest";
import { normalizeOem, redactVin, createResearchId } from "../shared/wpcResearch";

describe("WPC research contracts", () => {
  it("normalizes OEM separators while preserving the original input", () => {
    expect(normalizeOem(" 86511 n7000 ")).toEqual({
      originalInput: "86511 n7000",
      normalizedOem: "86511-N7000",
      displayOem: "86511-N7000",
    });
  });

  it("redacts VINs for safe public-facing evidence", () => {
    expect(redactVin("U5YPV81B5RL152160")).toBe("U5YPV81B5RL••••••");
  });

  it("creates traceable research ids", () => {
    expect(createResearchId(new Date("2026-09-23T12:00:00.000Z"), 42)).toBe("WPC-2026-000042");
  });
});
