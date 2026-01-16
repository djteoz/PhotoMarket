import { describe, it, expect } from "vitest";
import { getCitySlug, getCityName, getCityPrepositional } from "@/lib/cities";

describe("City Utilities", () => {
  describe("getCitySlug", () => {
    it("should convert known Russian city to slug", () => {
      expect(getCitySlug("Москва")).toBe("moscow");
      expect(getCitySlug("Санкт-Петербург")).toBe("saint-petersburg");
      expect(getCitySlug("Казань")).toBe("kazan");
    });

    it("should handle case insensitivity", () => {
      expect(getCitySlug("МОСКВА")).toBe("moscow");
      expect(getCitySlug("москва")).toBe("moscow");
    });

    it("should transliterate unknown cities", () => {
      // Returns transliterated version with soft sign becoming empty
      const result = getCitySlug("Тверь");
      expect(result).toContain("tver");
    });
  });

  describe("getCityName", () => {
    it("should convert slug back to Russian name (lowercase)", () => {
      // Returns lowercase version of city name
      expect(getCityName("moscow")).toBe("москва");
      expect(getCityName("saint-petersburg")).toBe("санкт-петербург");
      expect(getCityName("kazan")).toBe("казань");
    });

    it("should return null for unknown slugs", () => {
      expect(getCityName("unknown-city")).toBeNull();
    });
  });

  describe("getCityPrepositional", () => {
    it("should return prepositional case for known cities", () => {
      expect(getCityPrepositional("Москва")).toBe("Москве");
      expect(getCityPrepositional("Санкт-Петербург")).toBe("Санкт-Петербурге");
      expect(getCityPrepositional("Казань")).toBe("Казани");
    });

    it("should add default ending for unknown cities", () => {
      expect(getCityPrepositional("Тверь")).toBe("Тверье");
    });
  });
});
