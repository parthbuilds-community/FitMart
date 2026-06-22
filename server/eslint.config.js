const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest, 
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "prefer-const": "off",
      "no-useless-escape": "off",
      "no-empty": "off",
      "no-control-regex": "off"
    },
    ignores: ["node_modules/", "dist/", "build/"]
  }
];