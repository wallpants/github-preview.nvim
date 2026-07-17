import { describe, expect, it } from "bun:test";
import { getEntryName, getFileExt, getFileName, getSegments } from "./utils.ts";

describe("getSegments", () => {
   it("returns empty array for null", () => {
      expect(getSegments(null)).toEqual([]);
   });

   it("returns empty array for empty string", () => {
      expect(getSegments("")).toEqual([]);
   });

   it("splits path on slashes", () => {
      expect(getSegments("docs/guide/intro.md")).toEqual(["docs", "guide", "intro.md"]);
   });
});

describe("getEntryName", () => {
   it("returns file name for file paths", () => {
      expect(getEntryName("docs/guide/intro.md")).toBe("intro.md");
   });

   it("returns dir name for dir paths (trailing slash)", () => {
      expect(getEntryName("docs/guide/")).toBe("guide");
   });

   it("returns undefined for root path", () => {
      expect(getEntryName("")).toBeUndefined();
   });
});

describe("getFileName", () => {
   it("returns last path segment", () => {
      expect(getFileName("a/b/c.md")).toBe("c.md");
   });

   it("returns the path itself when there are no slashes", () => {
      expect(getFileName("README.md")).toBe("README.md");
   });

   it("returns undefined for undefined", () => {
      expect(getFileName(undefined)).toBeUndefined();
   });
});

describe("getFileExt", () => {
   it("returns extension", () => {
      expect(getFileExt("app/web/utils.test.ts")).toBe("ts");
   });

   it("returns undefined for undefined", () => {
      expect(getFileExt(undefined)).toBeUndefined();
   });
});
