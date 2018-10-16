module.exports = {
    extends: "airbnb",
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
          jsx: false,
        },
        sourceType: 'module',
    },
};