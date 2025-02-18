"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// ColumnComponent.tsx
const react_1 = require("react");
//  Necessary functions and contexts for drag-and-drop
const sortable_1 = require("@dnd-kit/sortable");
const utilities_1 = require("@dnd-kit/utilities");
const CardComponent_1 = __importDefault(require("./CardComponent"));
//  API functions for column actions
const API = __importStar(require("./api"));
//  Modal components for prompts
const ModalPrompt_1 = require("./ModalPrompt");
const useDoubleTap_1 = require("./useDoubleTap");
const react_i18next_1 = require("react-i18next");
// ColumnComponent displays columns and cards in them.
const ColumnComponent = ({ column, boardId, refreshBoard, showModal }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const { attributes, listeners, setNodeRef, transform, transition } = (0, sortable_1.useSortable)({
        id: `col-${column._id}`,
    });
    //Define inline styles for drag
    const style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition,
    };
    //State for editing the column title
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editTitle, setEditTitle] = (0, react_1.useState)(column.title);
    //Finnish editing the column title and call API to change.
    const finishEditing = () => {
        if (editTitle.trim() !== "" && editTitle !== column.title) {
            API.renameColumn(boardId, column._id, editTitle)
                .then((updated) => refreshBoard(updated))
                .catch((error) => {
                console.error(error);
                alert("Error renaming column.");
            });
        }
        setIsEditing(false);
    };
    //Delete column via intial confirmation modal
    const handleDelete = async () => {
        showModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.ConfirmModal, { message: t('HandleDeletionMessage', 'Do you want to delete this column?'), onConfirm: async () => {
                showModal(null);
                try {
                    const updated = await API.deleteColumn(boardId, column._id);
                    refreshBoard(updated);
                }
                catch (error) {
                    console.error(error);
                    alert("Error deleting column.");
                }
            }, onCancel: () => showModal(null) }));
    };
    //Double-tap hook for mobile devices.
    const handleColumnDoubleTap = (0, useDoubleTap_1.useDoubleTap)(() => setIsEditing(true));
    //Adding new card to the column with modal
    const handleAddCard = async () => {
        showModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.CardInputModal, { title: t('HandleModalInputCard', 'Add Card'), onConfirm: (cardTitle, cardDescription) => {
                showModal(null);
                if (!cardTitle.trim())
                    return;
                API.addCard(boardId, column._id, cardTitle, cardDescription)
                    .then((updated) => refreshBoard(updated))
                    .catch((error) => {
                    console.error(error);
                    alert("Error adding card.");
                });
            }, onCancel: () => showModal(null) }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "column", ref: setNodeRef, style: style, children: [(0, jsx_runtime_1.jsxs)("div", { className: "column-drag-handle", ...attributes, ...listeners, children: [(0, jsx_runtime_1.jsx)("span", { className: "drag-icon", style: { cursor: "grab" }, children: "\u2630" }), (0, jsx_runtime_1.jsx)("button", { className: "delete-column-btn", onClick: handleDelete, children: t('DeleteColumnButton', 'Delete Column') })] }), (0, jsx_runtime_1.jsx)("div", { className: "column-title", onDoubleClick: (e) => { e.stopPropagation(); setIsEditing(true); }, onTouchEnd: handleColumnDoubleTap, children: isEditing ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editTitle, onChange: (e) => setEditTitle(e.target.value), onBlur: finishEditing, onKeyDown: (e) => { if (e.key === "Enter")
                        finishEditing(); }, autoFocus: true })) : ((0, jsx_runtime_1.jsx)("h3", { children: column.title })) }), (0, jsx_runtime_1.jsx)("button", { className: "add-card-btn", onClick: handleAddCard, children: t('AddCardButton', 'Add Card') }), (0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: column.cards.map((card) => `card-${column._id}-${card._id}`), strategy: sortable_1.verticalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { className: "cards", children: column.cards.map((card) => ((0, jsx_runtime_1.jsx)(CardComponent_1.default, { card: card, columnId: column._id, boardId: boardId, refreshBoard: refreshBoard, showModal: showModal }, card._id))) }) })] }));
};
exports.default = ColumnComponent;
