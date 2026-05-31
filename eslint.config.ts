/* eslint import-x/no-named-as-default-member: 0 */
/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
   tseslint.configs.strictTypeChecked,
   tseslint.configs.stylisticTypeChecked,
   importX.flatConfigs.recommended,
   importX.flatConfigs.typescript,
   reactHooks.configs.flat["recommended-latest"],
   react.configs.flat.recommended!,
   react.configs.flat["jsx-runtime"]!,
   {
      languageOptions: {
         parserOptions: {
            projectService: true,
         },
      },
      settings: {
         react: { version: "detect" },
         "import-x/resolver-next": [
            createTypeScriptImportResolver({
               // Resolve Bun modules
               bun: true,
               project: ["./tsconfig.json"],
            }),
         ],
      },
      rules: {
         "import-x/no-deprecated": 1,
         "import-x/no-empty-named-blocks": 1,
         "import-x/no-extraneous-dependencies": 1,
         "@typescript-eslint/consistent-type-definitions": ["error", "type"],
         "@typescript-eslint/only-throw-error": 0,
         "@typescript-eslint/no-misused-promises": 0,
         "@typescript-eslint/restrict-template-expressions": 0,
         "@typescript-eslint/no-unused-vars": [
            "error",
            {
               varsIgnorePattern: "^_",
               argsIgnorePattern: "^_",
               caughtErrorsIgnorePattern: "^_",
            },
         ],
      },
   },
]);
