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
const sortable_1 = require("@dnd-kit/sortable");
const utilities_1 = require("@dnd-kit/utilities");
const CardComponent_1 = __importDefault(require("./CardComponent"));
const API = __importStar(require("./api"));
const ColumnComponent = ({ column, boardId, refreshBoard }) => {
    // useSortable for the column wrapper with id "col-{column._id}"
    const { attributes, listeners, setNodeRef, transform, transition } = (0, sortable_1.useSortable)({ id: `col-${column._id}` });
    const style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition,
        background: "#f0f0f0",
        borderRadius: 4,
        padding: 8,
        width: 250,
        minHeight: 300,
    };
    async function handleRename() {
        const newTitle = prompt("Enter new column title:", column.title);
        if (!newTitle)
            return;
        try {
            const updated = await API.renameColumn(boardId, column._id, newTitle);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error renaming column.");
        }
    }
    async function handleDelete() {
        if (!confirm("Delete this column?"))
            return;
        try {
            const updated = await API.deleteColumn(boardId, column._id);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error deleting column.");
        }
    }
    async function handleAddCard() {
        const title = prompt("Enter card title:");
        if (!title)
            return;
        const description = prompt("Enter card description:") || "";
        try {
            const updated = await API.addCard(boardId, column._id, title, description);
            refreshBoard(updated);
        }
        catch (error) {
            console.error(error);
            alert("Error adding card.");
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", justifyContent: "space-between" }, children: [(0, jsx_runtime_1.jsx)("h3", { children: column.title }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleRename, children: "Rename" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDelete, children: "Delete" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleAddCard, children: "Add Card" }), (0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: column.cards.map(card => `card-${column._id}-${card._id}`), strategy: sortable_1.verticalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { style: { marginTop: "8px" }, children: column.cards.map(card => ((0, jsx_runtime_1.jsx)(CardComponent_1.default, { card: card, columnId: column._id, boardId: boardId, refreshBoard: refreshBoard }, card._id))) }) })] }));
};
exports.default = ColumnComponent;
