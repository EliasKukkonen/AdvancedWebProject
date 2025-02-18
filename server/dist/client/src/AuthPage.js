"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
//AuthPage.tsx
const react_1 = require("react");
require("./AuthPage.css");
const react_i18next_1 = require("react-i18next");
const i18n_1 = __importDefault(require("./i18n")); // Import the i18n instance
//Base URL for API calls
const BASE_URL = 'http://localhost:3000';
//Component to handle user registration and login
const AuthPage = ({ onLogin }) => {
    const { t } = (0, react_i18next_1.useTranslation)(); //Language
    const [showRegister, setShowRegister] = (0, react_1.useState)(true);
    const [regEmail, setRegEmail] = (0, react_1.useState)('');
    const [regPassword, setRegPassword] = (0, react_1.useState)('');
    const [regIsAdmin, setRegIsAdmin] = (0, react_1.useState)(false);
    const [loginEmail, setLoginEmail] = (0, react_1.useState)('');
    const [loginPassword, setLoginPassword] = (0, react_1.useState)('');
    //Logout messages in the URL when component mounts
    (0, react_1.useEffect)(() => {
        const params = new URLSearchParams(window.location.search);
        const logoutMessage = params.get('message');
        if (logoutMessage) {
            alert(logoutMessage);
        }
    }, []);
    //Registration form submission.
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            //Call register endpoint
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: regEmail,
                    password: regPassword,
                    isAdmin: regIsAdmin, //Wasn't implemented, stays for future improvements.
                }),
            });
            //Check if there is issue with the responses
            if (!response.ok) {
                const errorData = await response.json();
                alert(t('registrationFailed', 'Registration failed: ') + errorData.message);
                return;
            }
            //Registration succesfull, notify user.
            alert(t('registrationSuccess', 'Registration successful! You can now log in.'));
            setRegEmail('');
            setRegPassword('');
            setRegIsAdmin(false);
            //Switch to login form
            setShowRegister(false);
        }
        catch (err) {
            console.error(err);
            alert(t('registrationError', 'An error occurred during registration.'));
        }
    };
    //Handle login form submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            //Call to the endpoint of the login
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            });
            //Check if ok
            if (!response.ok) {
                const errorData = await response.json();
                alert(t('loginFailed', 'Login failed: ') + errorData.message);
                return;
            }
            //Login successfull
            const data = await response.json();
            localStorage.setItem('token', data.token); //Store token
            //Redirect to the main (kanban) page.
            if (onLogin) {
                onLogin(data.token);
            }
            window.location.href = 'main.html';
        }
        catch (err) {
            console.error(err);
            alert(t('loginError', 'An error occurred during login.'));
        }
    };
    // Language switcher handler using imported i18n
    const changeLanguage = (lng) => {
        i18n_1.default.changeLanguage(lng).then(() => {
            console.log("Language changed to", lng);
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "auth-page", children: [(0, jsx_runtime_1.jsxs)("div", { className: "language-switcher", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('en'), children: "English" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('fi'), children: "Finnish" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('ru'), children: "Russian" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "auth-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: t('welcomeMessage', 'Welcome to the Kanban Board') }), (0, jsx_runtime_1.jsx)("h2", { children: t('accessMessage', 'To Access Kanban, Register or Login') }), (0, jsx_runtime_1.jsxs)("div", { className: "auth-toggle", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowRegister(true), children: t('register', 'Register') }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowRegister(false), children: t('login', 'Login') })] }), showRegister ? (
                    //Registration form 
                    (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h2", { children: t('registerForm', 'Register Form') }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRegisterSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: t('email', 'Email') }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: regEmail, onChange: (e) => setRegEmail(e.target.value), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: t('password', 'Password') }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: regPassword, onChange: (e) => setRegPassword(e.target.value), required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: t('register', 'Register') })] })] })) : (
                    //Login form
                    (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h2", { children: t('loginForm', 'Login Form') }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLoginSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: t('email', 'Email') }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: loginEmail, onChange: (e) => setLoginEmail(e.target.value), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: t('password', 'Password') }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: loginPassword, onChange: (e) => setLoginPassword(e.target.value), required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: t('login', 'Login') })] })] }))] })] }));
};
exports.default = AuthPage;
