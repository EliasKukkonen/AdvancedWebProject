"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardInputModal = exports.ConfirmModal = exports.InputModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// ModalPrompt.tsx
const react_1 = require("react");
require("./ModalPrompt.css");
const react_i18next_1 = require("react-i18next");
//Modal that prompts the user to input a value
const InputModal = ({ title, label, defaultValue, onConfirm, onCancel, }) => {
    // Local state to manage the current input value
    const [value, setValue] = (0, react_1.useState)(defaultValue || "");
    const { t } = (0, react_i18next_1.useTranslation)();
    return (
    //Overlay for the modal
    (0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "modal-content", children: [(0, jsx_runtime_1.jsx)("h3", { children: title }), label && (0, jsx_runtime_1.jsx)("label", { children: label }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: (e) => setValue(e.target.value), autoFocus: true }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => onConfirm(value), children: t('OKModal', 'OK') }), (0, jsx_runtime_1.jsx)("button", { onClick: onCancel, children: t('CancelModal', 'Cancel') })] })] }) }));
};
exports.InputModal = InputModal;
//Component for confirmation modal (YES/NO)
const ConfirmModal = ({ message, onConfirm, onCancel, }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    return (
    //Overlay
    (0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "modal-content", children: [(0, jsx_runtime_1.jsx)("p", { children: message }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onConfirm, children: t('YESModal', 'YES') }), (0, jsx_runtime_1.jsx)("button", { onClick: onCancel, children: t('NOModal', 'NO') })] })] }) }));
};
exports.ConfirmModal = ConfirmModal;
//Specific modal for the card input, component.
const CardInputModal = ({ title, onConfirm, onCancel, }) => {
    //Sets the card title and card desrciption
    const { t } = (0, react_i18next_1.useTranslation)();
    const [cardTitle, setCardTitle] = (0, react_1.useState)("");
    const [cardDescription, setCardDescription] = (0, react_1.useState)("");
    return (
    //Overlay
    (0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "modal-content", children: [(0, jsx_runtime_1.jsx)("h3", { children: title }), (0, jsx_runtime_1.jsx)("label", { children: t('CardTitleModalPrompt', 'Card Title') }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: cardTitle, onChange: (e) => setCardTitle(e.target.value), autoFocus: true }), (0, jsx_runtime_1.jsxs)("label", { children: [t('CardDescriptionModalPromt', 'Card Description (optional)'), ":"] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: cardDescription, onChange: (e) => setCardDescription(e.target.value) }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => onConfirm(cardTitle, cardDescription), children: "OK" }), (0, jsx_runtime_1.jsx)("button", { onClick: onCancel, children: t('CancelCardButtonModal', 'Cancel') })] })] }) }));
};
exports.CardInputModal = CardInputModal;
