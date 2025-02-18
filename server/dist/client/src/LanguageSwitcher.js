"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
// A simple language switcher component that allows users to change the app's language
const LanguageSwitcher = () => {
    const { i18n } = (0, react_i18next_1.useTranslation)();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    return (
    // Container with styling to arrange buttons.
    (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px', margin: '1rem 0', justifyContent: 'center' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('en'), children: "English" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('fi'), children: "Finnish" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('ru'), children: "Russian" })] }));
};
exports.default = LanguageSwitcher;
