"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = __importDefault(require("react-dom/client"));
const KanbanBoard_1 = __importDefault(require("./KanbanBoard"));
const root = document.getElementById("root");
if (root) {
    client_1.default.createRoot(root).render((0, jsx_runtime_1.jsx)(KanbanBoard_1.default, {}));
}
