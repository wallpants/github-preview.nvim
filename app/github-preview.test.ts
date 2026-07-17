import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GithubPreview } from "./github-preview.ts";
import { defaultConfig } from "./types.test.ts";
import { type GithubPreviewConfig, type UpdateConfigAction } from "./types.ts";

const tmpDirs: string[] = [];

afterAll(() => {
   for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function makeRepo(gitConfigContent?: string): string {
   const root = mkdtempSync(join(tmpdir(), "github-preview-test-"));
   tmpDirs.push(root);
   if (gitConfigContent !== undefined) {
      mkdirSync(join(root, ".git"));
      writeFileSync(join(root, ".git", "config"), gitConfigContent);
   }
   return root + "/";
}

describe("getRepoName", () => {
   it("extracts repo name from origin remote", async () => {
      const root = makeRepo(
         [
            "[core]",
            "\trepositoryformatversion = 0",
            '[remote "origin"]',
            "\turl = git@github.com:gualcasas/github-preview.nvim.git",
            "\tfetch = +refs/heads/*:refs/remotes/origin/*",
         ].join("\n"),
      );
      expect(await GithubPreview.getRepoName({ root })).toBe("github-preview.nvim");
   });

   it('falls back to "root" when .git/config is missing', async () => {
      const root = makeRepo();
      expect(await GithubPreview.getRepoName({ root })).toBe("root");
   });

   it('falls back to "root" when there is no origin remote', async () => {
      const root = makeRepo("[core]\n\trepositoryformatversion = 0");
      expect(await GithubPreview.getRepoName({ root })).toBe("root");
   });
});

describe("updateConfig", () => {
   type FakeApp = {
      config: GithubPreviewConfig;
      nvim: { call: (fn: string, args: unknown[]) => Promise<void> };
      notifications: unknown[][];
   };

   function makeApp(dotfilesPatch: Partial<typeof defaultConfig> = {}): FakeApp {
      const dotfiles = structuredClone({ ...defaultConfig, ...dotfilesPatch });
      const app: FakeApp = {
         config: { dotfiles, overrides: structuredClone(dotfiles) },
         notifications: [],
         nvim: {
            call: (_fn, args) => {
               app.notifications.push(args);
               return Promise.resolve();
            },
         },
      };
      return app;
   }

   async function updateConfig(app: FakeApp, action: UpdateConfigAction) {
      await GithubPreview.prototype.updateConfig.call(app as unknown as GithubPreview, action);
   }

   it("updates theme name", async () => {
      const app = makeApp();
      await updateConfig(app, ["theme_name", "dark"]);
      expect(app.config.overrides.theme.name).toBe("dark");
      // dotfiles config remains untouched
      expect(app.config.dotfiles.theme.name).toBe("system");
   });

   it("toggles scroll", async () => {
      const app = makeApp();
      await updateConfig(app, ["scroll", "toggle"]);
      expect(app.config.overrides.scroll.disable).toBe(true);
      await updateConfig(app, ["scroll", "toggle"]);
      expect(app.config.overrides.scroll.disable).toBe(false);
   });

   it("updates cursorline opacity", async () => {
      const app = makeApp();
      await updateConfig(app, ["cursorline.opacity", 0.8]);
      expect(app.config.overrides.cursor_line.opacity).toBe(0.8);
   });

   it("restores dotfiles config on clear_overrides", async () => {
      const app = makeApp();
      await updateConfig(app, ["theme_name", "dark"]);
      await updateConfig(app, ["scroll", "off"]);
      await updateConfig(app, ["clear_overrides"]);
      expect(app.config.overrides.theme.name).toBe("system");
      expect(app.config.overrides.scroll.disable).toBe(false);
   });

   it("allows enabling single-file mode at runtime", async () => {
      const app = makeApp();
      await updateConfig(app, ["single_file", "on"]);
      expect(app.config.overrides.single_file).toBe(true);
   });

   it("prevents disabling single-file mode when plugin launched in single-file mode", async () => {
      const app = makeApp({ single_file: true });
      await updateConfig(app, ["single_file", "off"]);
      expect(app.config.overrides.single_file).toBe(true);
      // user is notified about the restriction
      expect(app.notifications.length).toBe(1);
   });
});
