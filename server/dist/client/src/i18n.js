"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const i18next_http_backend_1 = __importDefault(require("i18next-http-backend"));
const i18next_browser_languagedetector_1 = __importDefault(require("i18next-browser-languagedetector"));
//Language component for the translation
i18next_1.default
    .use(i18next_http_backend_1.default)
    .use(i18next_browser_languagedetector_1.default)
    .use(react_i18next_1.initReactI18next)
    .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
        escapeValue: false,
    },
    backend: {
        // path where language translations are loaded from.
        loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
});
exports.default = i18next_1.default;
