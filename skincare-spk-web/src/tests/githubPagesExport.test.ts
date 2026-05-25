import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(process.cwd(), "..");
const staticDataPath = path.join(projectRoot, "docs", "data", "app-data.json");

describe("GitHub Pages static export data", () => {
  it("contains the required source-documented knowledge data for the static site", () => {
    const payload = JSON.parse(fs.readFileSync(staticDataPath, "utf8")) as {
      metadata: Record<string, unknown>;
      ingredients: unknown[];
      skinTypes: unknown[];
      skinConditions: unknown[];
      fuzzyRules: unknown[];
    };

    expect(payload.metadata.knowledge_status).toBe("source_documented");
    expect(payload.ingredients).toHaveLength(95);
    expect(payload.skinTypes).toHaveLength(5);
    expect(payload.skinConditions).toHaveLength(7);
    expect(payload.fuzzyRules).toHaveLength(15);
  });
});
