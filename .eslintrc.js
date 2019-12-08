module.exports = {
    root: true,
    env: {
      node: true
    },
    extends: [
        // "eslint:recommended",
        // "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint"
    ],
    rules: {
      "semi": "off",
      "@typescript-eslint/semi": ["error"]
    },
    parserOptions: {
      parser: '@typescript-eslint/parser'
    },
    overrides: [
      {
        files: [
          '**/__tests__/*.{j,t}s?(x)'
        ],
        env: {
          jest: true
        }
      }
    ]
  }
