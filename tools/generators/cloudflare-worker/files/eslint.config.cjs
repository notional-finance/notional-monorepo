const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    ignores: ["!**/*"],
}, ...compat.extends("../../.eslintrc.json"), {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {},
}, {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {},
}, {
    files: ["**/*.js", "**/*.jsx"],
    rules: {},
}];