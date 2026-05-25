import { describe, expect, it } from "vitest";
import { parseTakeLimit } from "@/lib/api/pagination";

describe("parseTakeLimit", () => {
  it("uses the provided positive limit", () => {
    expect(parseTakeLimit("3")).toBe(3);
  });

  it("falls back to the default limit for invalid values", () => {
    expect(parseTakeLimit(null)).toBe(150);
    expect(parseTakeLimit("abc")).toBe(150);
    expect(parseTakeLimit("0")).toBe(150);
  });

  it("caps overly large values", () => {
    expect(parseTakeLimit("999")).toBe(150);
    expect(parseTakeLimit("999", { maxLimit: 25 })).toBe(25);
  });
});
