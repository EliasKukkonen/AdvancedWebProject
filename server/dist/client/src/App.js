"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
//App.tsx file, for the front end.
const react_1 = require("react");
const AuthPage_1 = __importDefault(require("./AuthPage"));
const KanbanBoard_1 = __importDefault(require("./KanbanBoard"));
require("./App.css");
//Main component, decides to show the auhtetntication screen
function App() {
    //State to save token
    const [token, setToken] = (0, react_1.useState)(null);
    //Store authentication token
    (0, react_1.useEffect)(() => {
        // Check if a token is already in localStorage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { children: token ? (
        // If token exists render the kanban board
        (0, jsx_runtime_1.jsx)(KanbanBoard_1.default, {})) : (
        //Otherwise render the auth page
        (0, jsx_runtime_1.jsx)(AuthPage_1.default, { onLogin: (newToken) => {
                //Save the token in localstorage
                localStorage.setItem('token', newToken);
                setToken(newToken);
            } })) }));
}
exports.default = App;
