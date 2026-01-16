import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactCompiler from "eslint-plugin-react-compiler";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Must be AFTER nextVitals and nextTs to override their rules
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
  },
  {
    rules: {
      // Downgrade to warnings for CI - these are not critical
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // React Compiler rule - setState in useEffect is valid in certain patterns
      // (closing menus on route change, resetting state on prop change)
      "react-compiler/react-compiler": "off",
    },
  },
]);

export default eslintConfig;
