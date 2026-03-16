import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import css from "@eslint/css";

import stylistic from "@stylistic/eslint-plugin";

import {
    defineConfig
} from "eslint/config";

export default defineConfig([{
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
        js,
        "@stylistic": stylistic
    },

    rules: {
        "@stylistic/indent": ["error", 4],
        "@stylistic/quotes": ["warn", "double"],
        "@stylistic/semi": ["error", "always"],
        "@stylistic/no-extra-semi": "error",
        "@stylistic/line-comment-position": ["error", { "position": "above" }]

    },
    extends: ["js/recommended"],
    languageOptions: {
        globals: globals.node
    }
},
{
    files: ["**/*.js"],
    languageOptions: {
        sourceType: "commonjs"
    }
},
tseslint.configs.recommended,
{
    files: ["**/*.json"],
    plugins: {
        json
    },
    language: "json/json",
    extends: ["json/recommended"]
},
{
    files: ["**/*.css"],
    plugins: {
        css
    },
    language: "css/css",
    extends: ["css/recommended"]
},
]);