import { describe, expect, it } from "bun:test";
import { PluginPropsSchema, ThemeSchema, type PluginProps } from "./types.ts";

// mirrors the default config in lua/github-preview/config.lua
export const defaultConfig: PluginProps["config"] = {
   host: "localhost",
   port: 6041,
   allow_multiple_instances: false,
   single_file: false,
   theme: {
      name: "system",
      high_contrast: false,
   },
   details_tags_open: true,
   cursor_line: {
      disable: false,
      color: "#c86414",
      opacity: 0.2,
   },
   scroll: {
      disable: false,
      top_offset_pct: 35,
   },
};

const validProps: PluginProps = {
   init: {
      root: "/Users/wallpants/repo/",
      path: "/Users/wallpants/repo/README.md",
   },
   config: defaultConfig,
};

describe("ThemeSchema", () => {
   it("accepts valid themes", () => {
      expect(ThemeSchema.safeParse({ name: "dark", high_contrast: true }).success).toBe(true);
      expect(ThemeSchema.safeParse({ name: "system", high_contrast: false }).success).toBe(true);
   });

   it("rejects invalid theme names", () => {
      expect(ThemeSchema.safeParse({ name: "solarized", high_contrast: false }).success).toBe(
         false,
      );
   });
});

describe("PluginPropsSchema", () => {
   it("accepts props matching the lua default config", () => {
      expect(PluginPropsSchema.safeParse(validProps).success).toBe(true);
   });

   it("rejects cursor_line.opacity outside [0, 1]", () => {
      const props = structuredClone(validProps);
      props.config.cursor_line.opacity = 1.5;
      expect(PluginPropsSchema.safeParse(props).success).toBe(false);
   });

   it("rejects missing init.root", () => {
      const props = structuredClone(validProps) as Record<string, unknown>;
      props.init = { path: "/Users/wallpants/repo/README.md" };
      expect(PluginPropsSchema.safeParse(props).success).toBe(false);
   });

   it("rejects non-numeric port", () => {
      const props = structuredClone(validProps);
      // @ts-expect-error testing runtime validation
      props.config.port = "6041";
      expect(PluginPropsSchema.safeParse(props).success).toBe(false);
   });
});
