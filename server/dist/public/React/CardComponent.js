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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const sortable_1 = require("@dnd-kit/sortable");
const utilities_1 = require("@dnd-kit/utilities");
const API = __importStar(require("./api"));
const CardComponent = ({ card, columnId, boardId, refreshBoard }) => {
    // useSortable for card, with id format "card-{columnId}-{card._id}"
    const { attributes, listeners, setNodeRef, transform, transition } = (0, sortable_1.useSortable)({ id: `card-${columnId}-${card._id}` });
    const style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition,
        background: card.color || "#fff",
        border: "1px solid #ddd",
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
        cursor: "grab",
    };
    async function handleRename() {
        // prompt returns string | null so convert null to undefined
        const titleInput = prompt("Enter new card title:", card.title);
        const newTitle = titleInput === null ? undefined : titleInput;
        const descInput = prompt("Enter new card description:", card.description || "");
        const newDescription = descInput === null ? undefined : descInput;
        try {
            const updated = await API.renameCard(boardId, columnId, card._id, newTitle, newDescription);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error renaming card: " + error.message);
        }
    }
    async function handleDelete() {
        if (!confirm("Delete this card?"))
            return;
        try {
            const updated = await API.deleteCard(boardId, columnId, card._id);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error deleting card.");
        }
    }
    async function handleColorChange(e) {
        const color = e.target.value;
        try {
            const updated = await API.updateCardColor(boardId, columnId, card._id, color);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error updating card color.");
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: [(0, jsx_runtime_1.jsx)("h4", { children: card.title }), (0, jsx_runtime_1.jsx)("p", { children: card.description }), (0, jsx_runtime_1.jsx)("input", { type: "color", value: card.color || "#ffffff", onChange: handleColorChange }), (0, jsx_runtime_1.jsx)("button", { onClick: handleRename, children: "Rename" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDelete, children: "Delete" })] }));
};
exports.default = CardComponent;
