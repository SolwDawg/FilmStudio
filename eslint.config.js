import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// Module boundaries (see the header of each module's index.ts). Another module is reached only
// through its index.js, and each module may import only the layers listed in `allowed`.
const MODULES = ["core", "browser", "flow", "gflow", "domain", "media", "render", "dashboard"];
const deepImport = {
  regex: `(^|/)(${MODULES.join("|")})/(?!index\\.js$)[^/]+$`,
  message: "Import another module through its index.js, not its internal files."
};
const layer = (files, forbidden) => ({
  files,
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          deepImport,
          { regex: `(^|/)(${forbidden.join("|")})/`, message: `This module must not depend on: ${forbidden.join(", ")}.` }
        ]
      }
    ]
  }
});

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "node_modules", "gflow-output", ".gflow", "scripts", "archive", "projects"]
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  },
  {
    files: ["src/**/*.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [deepImport] }] }
  },
  layer(["src/core/**/*.ts"], ["browser", "flow", "gflow", "studio"]),
  layer(["src/browser/**/*.ts"], ["flow", "gflow", "studio"]),
  layer(["src/flow/**/*.ts"], ["browser", "gflow", "studio"]),
  layer(["src/studio/domain/**/*.ts"], ["browser", "flow", "gflow", "media", "render", "dashboard"]),
  layer(["src/studio/media/**/*.ts"], ["browser", "flow", "gflow", "domain", "render", "dashboard"]),
  layer(["src/studio/render/**/*.ts"], ["browser", "flow", "gflow", "dashboard"]),
  layer(["src/studio/dashboard/**/*.ts"], ["browser", "flow", "gflow"])
);
