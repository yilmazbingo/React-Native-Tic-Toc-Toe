module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        //this will block eslint showing conflicting prettier errors. prettier will handle it
        "prettier"
        //prettier/@typescript-eslint has been removed in eslint-config-prettier v8.0.0. Just remove it from your ESLint config file. The only entry in extends that is needed now for Prettier and ESLint to not conflict is "prettier" (make sure it's the last one in extends).
        // "prettier/@typescript-eslint",
        // "prettier/react"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: "module"
    },
    plugins: ["react", "@typescript-eslint"],
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        "no-console": "warn"
    }
};
