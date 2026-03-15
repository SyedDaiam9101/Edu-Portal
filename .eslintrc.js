module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/.expo/**",
    "**/.expo-shared/**"
  ],
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      plugins: ["@typescript-eslint", "import", "react", "react-hooks", "unused-imports"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier"
      ],
      settings: {
        react: { version: "detect" },
        "import/resolver": {
          typescript: {
            project: true
          }
        }
      },
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
        ],
        "import/order": [
          "error",
          {
            "newlines-between": "always",
            "alphabetize": { order: "asc", caseInsensitive: true }
          }
        ],
        "react/react-in-jsx-scope": "off"
      }
    },
    {
      files: ["**/*.{js,cjs,mjs}"],
      env: { node: true, es2022: true },
      parserOptions: { sourceType: "module" },
      extends: ["eslint:recommended", "prettier"]
    },
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      extends: ["next/core-web-vitals"]
    },
    {
      files: ["**/*.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off"
      }
    }
  ]
};
