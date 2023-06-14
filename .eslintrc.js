module.exports = {
  extends: [
    "@opencast/eslint-config-ts-react",
    "react-app/jest"
  ],
  rules: {
    // Semicolon usage is inconsistent right now. Both, "always" and "never",
    // result in a significant number of warnings.
    "semi": "off",

    // Both kinds of quotes are used a lot
    "quotes": "off",

    // "always" gives 319 warning, "never" gives 991.
    "object-curly-spacing": "off",

    // Many multiline lists do not have a trailing comma right now
    "comma-dangle": ["warn", "only-multiline"],

    // Currently there are quite a lot of lines longer than 120 chars (85 ones).
    // And 34 even longer than 140 chars.
    "max-len": "off",

    // Currently 120 warnings.
    "@typescript-eslint/no-explicit-any": "off",

    // `else` in new line is used often, and often an `if` condition is on the
    // same line as `{`.
    "brace-style": "off",

    // A few of those are used.
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  overrides: [
    {
      files: ["./*.js"],
      env: {
        node: true,
      },
    },
    {
      files: ["./*.ts", "tests/**"],
      parserOptions: {
        project: false,
      },
    },
  ],
};
