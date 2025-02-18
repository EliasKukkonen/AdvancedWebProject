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
// frontend/src/KanbanBoard.tsx
const react_1 = require("react");
const core_1 = require("@dnd-kit/core");
const sortable_1 = require("@dnd-kit/sortable");
const API = __importStar(require("./api"));
const ColumnComponent_1 = __importDefault(require("./ColumnComponent"));
const KanbanBoard = () => {
    const [board, setBoard] = (0, react_1.useState)(null);
    // On mount, fetch boards and select one.
    (0, react_1.useEffect)(() => {
        async function loadBoard() {
            try {
                const boards = await API.fetchBoards();
                if (boards.length > 0) {
                    const storedBoardId = localStorage.getItem("currentBoardId");
                    const selected = boards.find(b => b._id === storedBoardId) || boards[0];
                    setBoard(selected);
                    localStorage.setItem("currentBoardId", selected._id);
                }
            }
            catch (error) {
                console.error(error);
                alert("Error fetching board.");
            }
        }
        loadBoard();
    }, []);
    // Global drag end handler: distinguishes column drags and card drags.
    const handleDragEnd = async (event) => {
        if (!board)
            return;
        const { active, over } = event;
        if (!over)
            return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
        // COLUMN DRAG (IDs start with "col-")
        if (activeId.startsWith("col-") && overId.startsWith("col-")) {
            const oldIndex = board.columns.findIndex(c => `col-${c._id}` === activeId);
            const newIndex = board.columns.findIndex(c => `col-${c._id}` === overId);
            if (oldIndex === -1 || newIndex === -1)
                return;
            const newColumns = (0, sortable_1.arrayMove)(board.columns, oldIndex, newIndex);
            try {
                const updated = await API.updateColumnOrder(board._id, newColumns.map(c => c._id));
                setBoard(updated);
            }
            catch (error) {
                console.error(error);
                alert("Error reordering columns.");
            }
            return;
        }
        // CARD DRAG (IDs start with "card-")
        if (activeId.startsWith("card-")) {
            // Format: "card-{sourceColId}-{cardId}"
            const parts = activeId.split("-");
            if (parts.length < 3)
                return;
            const sourceColId = parts[1];
            const cardId = parts.slice(2).join("-"); // In case card id has dashes
            // The droppable that receives the card is the destination column
            // Its ID is expected to be "col-{destColId}"
            const destParts = overId.split("-");
            if (destParts.length !== 2)
                return;
            const destColId = destParts[1];
            const sourceColIndex = board.columns.findIndex(c => c._id === sourceColId);
            const destColIndex = board.columns.findIndex(c => c._id === destColId);
            if (sourceColIndex === -1 || destColIndex === -1)
                return;
            const sourceColumn = board.columns[sourceColIndex];
            const destColumn = board.columns[destColIndex];
            const cardIndex = sourceColumn.cards.findIndex(c => c._id === cardId);
            if (cardIndex === -1)
                return;
            const movedCard = sourceColumn.cards[cardIndex];
            // Determine the new index within the destination column.
            // Here, we use the position of the over item if it is a card,
            // otherwise, we default to appending.
            let newIndex = destColumn.cards.length;
            if (over.data.current && typeof over.data.current.sortableIndex === "number") {
                newIndex = over.data.current.sortableIndex;
            }
            // Remove the card from the source column.
            const newSourceCards = [...sourceColumn.cards];
            newSourceCards.splice(cardIndex, 1);
            // Insert the card into the destination column.
            const newDestCards = [...destColumn.cards];
            newDestCards.splice(newIndex, 0, movedCard);
            const newColumns = board.columns.map(col => {
                if (col._id === sourceColId)
                    return { ...col, cards: newSourceCards };
                if (col._id === destColId)
                    return { ...col, cards: newDestCards };
                return col;
            });
            try {
                if (sourceColId === destColId) {
                    // Reordering within the same column
                    const updated = await API.updateCardOrder(board._id, sourceColId, newDestCards.map(c => c._id));
                    setBoard(updated);
                }
                else {
                    // Moving card across columns
                    const updated = await API.moveCard(board._id, sourceColId, cardId, destColId, newIndex);
                    setBoard(updated);
                }
            }
            catch (error) {
                console.error(error);
                alert("Error moving card.");
            }
        }
    };
    async function handleCreateBoard() {
        const title = prompt("Enter board title:");
        if (!title)
            return;
        try {
            const newBoard = await API.createBoard(title);
            setBoard(newBoard);
            localStorage.setItem("currentBoardId", newBoard._id);
        }
        catch (error) {
            console.error(error);
            alert("Error creating board.");
        }
    }
    if (!board)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading board..." });
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: "16px" }, children: [(0, jsx_runtime_1.jsx)("h1", { children: board.title }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCreateBoard, children: "Create Board" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    // For demonstration, refresh board:
                    API.fetchBoards().then(bs => {
                        if (bs.length > 0) {
                            const selected = bs[0];
                            setBoard(selected);
                            localStorage.setItem("currentBoardId", selected._id);
                        }
                    }).catch(err => console.error(err));
                }, children: "Refresh Board" }), (0, jsx_runtime_1.jsx)("button", { onClick: async () => {
                    // Add Column button
                    const colTitle = prompt("Enter column title:");
                    if (!colTitle)
                        return;
                    try {
                        const updated = await API.addColumn(board._id, colTitle);
                        setBoard(updated);
                    }
                    catch (error) {
                        console.error(error);
                        alert("Error adding column.");
                    }
                }, children: "Add Column" }), (0, jsx_runtime_1.jsx)(core_1.DndContext, { collisionDetection: core_1.closestCenter, onDragEnd: handleDragEnd, children: (0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: board.columns.map(col => `col-${col._id}`), strategy: sortable_1.horizontalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: "16px" }, children: board.columns.map(column => ((0, jsx_runtime_1.jsx)(ColumnComponent_1.default, { column: column, boardId: board._id, refreshBoard: setBoard }, column._id))) }) }) })] }));
};
exports.default = KanbanBoard;
