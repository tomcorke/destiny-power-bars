import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

const sizeRules = [
  "max-lines",
  "max-lines-per-function",
  "max-params",
  "max-depth",
  "sonarjs/cognitive-complexity",
];

export default [
  { ignores: ["src/data/d2ai-module/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { import: importPlugin, sonarjs },
    rules: {
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-depth": ["error", 3],
      "max-nested-callbacks": ["error", 4],
      "max-params": ["error", 4],
      "max-lines-per-function": [
        "error",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    // Existing code over the limits. Split these up rather than adding to the list.
    files: [
      "src/components/CharacterDisplay/CharacterDisplay.tsx",
      "src/components/Settings/Settings.tsx",
      "src/components/VendorDisplay/VendorDisplay.tsx",
      "src/components/characterDisplayComponents/PowerBar.tsx",
      "src/components/characterDisplayComponents/PowerHints.tsx",
      "src/services/bungie-api.ts",
      "src/services/bungie-auth.ts",
      "src/services/items/joined-item.ts",
      "src/services/vendor-data/index.ts",
    ],
    rules: Object.fromEntries(sizeRules.map((rule) => [rule, "warn"])),
  },
  prettier,
];
