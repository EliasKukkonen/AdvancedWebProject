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
// KanbanBoard.tsx
const react_1 = require("react");
// Dnd-kit core components and events for drag-and-drop
const core_1 = require("@dnd-kit/core");
// Import sortable context and helpers for handling sorting
const sortable_1 = require("@dnd-kit/sortable");
//API for the api calls
const API = __importStar(require("./api"));
const ColumnComponent_1 = __importDefault(require("./ColumnComponent"));
require("./KanbanBoard.css");
const react_responsive_1 = require("react-responsive");
// Import modal components and double-tap hook
const ModalPrompt_1 = require("./ModalPrompt");
const useDoubleTap_1 = require("./useDoubleTap");
const react_i18next_1 = require("react-i18next");
const i18n_1 = __importDefault(require("./i18n")); // Import the i18n instance
// Main KanbanBoard component that renders the board and handles drag-and-drop
const KanbanBoard = () => {
    const { t } = (0, react_i18next_1.useTranslation)();
    // State for the current board, active drag item, search term, and filtered board view
    const [board, setBoard] = (0, react_1.useState)(null);
    const [activeId, setActiveId] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [filteredBoard, setFilteredBoard] = (0, react_1.useState)(null);
    // Modal state
    const [modal, setModal] = (0, react_1.useState)(null);
    // State for editing the board title
    const [isEditingBoard, setIsEditingBoard] = (0, react_1.useState)(false);
    const [boardTitle, setBoardTitle] = (0, react_1.useState)("");
    //Check for mobile device
    const isMobile = (0, react_responsive_1.useMediaQuery)({ query: "(max-width: 768px)" });
    // Sensors for drag-and-drop with specific activation parameters
    const sensors = (0, core_1.useSensors)((0, core_1.useSensor)(core_1.PointerSensor, { activationConstraint: { distance: 5 } }), (0, core_1.useSensor)(core_1.TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } }));
    //Language change function
    const changeLanguage = (lng) => {
        i18n_1.default.changeLanguage(lng).then(() => {
            console.log("Language changed to", lng);
        });
    };
    // Custom collision detection when dragging columns.
    const customCollisionDetection = (args) => {
        const { active } = args;
        if (typeof active.id === "string" && active.id.startsWith("col-")) {
            return (0, core_1.pointerWithin)(args);
        }
        return (0, core_1.closestCenter)(args);
    };
    // For board title double-tap on touch devices:
    const handleBoardDoubleTap = (0, useDoubleTap_1.useDoubleTap)(() => setIsEditingBoard(true));
    // Navigation bar component for saerch, adding columns, and logout and language functionality
    const NavBar = () => {
        const [tempSearchTerm, setTempSearchTerm] = (0, react_1.useState)(searchTerm);
        //Logout, removing the token and boardID from local storage (BoardID is as well stored in the DB)
        const handleLogout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("currentBoardId");
            window.location.reload();
        };
        //Add new column via modal prompt
        const handleAddColumn = () => {
            setModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.InputModal, { title: t("columnMessage", "Add column name"), label: t("columnMessage2", "Add column name"), onConfirm: (value) => {
                    setModal(null);
                    if (!value.trim())
                        return;
                    API.addColumn(board._id, value)
                        .then((updated) => setBoard(updated))
                        .catch((error) => {
                        console.error(error);
                        alert("Error adding column.");
                    });
                }, onCancel: () => setModal(null) }));
        };
        //Handle search to filter out cards. When filtered only cards are shown which are searched with the columns where these types of cards are.
        const handleSearch = () => {
            if (!board)
                return;
            setSearchTerm(tempSearchTerm);
            if (!tempSearchTerm.trim()) {
                setFilteredBoard(null);
                return;
            }
            const lower = tempSearchTerm.toLowerCase();
            const filteredColumns = board.columns
                .map((col) => {
                const newCards = col.cards.filter((card) => card.title.toLowerCase().includes(lower) ||
                    (card.description || "").toLowerCase().includes(lower));
                return { ...col, cards: newCards };
            })
                .filter((col) => col.cards.length > 0);
            const newBoard = { ...board, columns: filteredColumns };
            setFilteredBoard(newBoard);
        };
        return (
        //Navigation bar with languages
        (0, jsx_runtime_1.jsxs)("nav", { className: "navbar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "navbar-left", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: t('searchButtonPlaceholder', 'Search'), value: tempSearchTerm, onChange: (e) => setTempSearchTerm(e.target.value), className: "navbar-search-input" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSearch, className: "navbar-search-btn", children: t('searchButton', 'Search') })] }), (0, jsx_runtime_1.jsxs)("div", { className: "navbar-right", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleAddColumn, className: "navbar-btn", children: t('AddColumnButton', 'Add Column') }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "navbar-btn", children: t('LogoutButton', 'Logout') }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('en'), children: "Eng" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('fi'), children: "Fin" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => changeLanguage('ru'), children: "Rus" })] })] }));
    };
    // Load board the board data from API when component is active
    (0, react_1.useEffect)(() => {
        async function loadBoard() {
            try {
                const boards = await API.fetchBoards();
                if (boards.length > 0) {
                    const selected = boards[0];
                    //Ensure that columns are empty arrays
                    const normalizedBoard = { ...selected, columns: selected.columns || [] };
                    setBoard(normalizedBoard);
                    setBoardTitle(normalizedBoard.title);
                    localStorage.setItem("currentBoardId", normalizedBoard._id);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        loadBoard();
    }, []);
    // Function to finish editing board title and call API
    const finishEditingBoard = async () => {
        if (!board)
            return;
        if (boardTitle.trim() !== "" && boardTitle !== board.title) {
            try {
                const updated = await API.renameBoard(board._id, boardTitle);
                setBoard(updated);
            }
            catch (error) {
                console.error(error);
                alert("Error renaming board.");
            }
        }
        setIsEditingBoard(false);
    };
    //Activate the drag item when dragging starts
    const handleDragStart = (event) => {
        setActiveId(event.active.id.toString());
    };
    //Handle drag and events to update column or card order via API call.
    //After dragging cards have new position in the DB, the API call does it.
    const handleDragEnd = async (event) => {
        setActiveId(null);
        if (!board)
            return;
        const { active, over } = event;
        if (!over)
            return;
        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();
        // Handle column drag-and-drop
        if (activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
            const oldIndex = board.columns.findIndex((c) => `col-${c._id}` === activeIdStr); //Old index (ID) before dragging
            const newIndex = board.columns.findIndex((c) => `col-${c._id}` === overIdStr); //New index after the drag
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
                return;
            const newColumns = (0, sortable_1.arrayMove)(board.columns, oldIndex, newIndex);
            try {
                //Set new order
                const updated = await API.updateColumnOrder(board._id, newColumns.map((c) => c._id));
                setBoard(updated);
            }
            catch (error) {
                console.error(error);
                alert("Error reordering columns.");
            }
            return;
        }
        // Handle card drag-and-drop
        if (activeIdStr.startsWith("card-")) { //Check if the draggable item is card
            const activeParts = activeIdStr.split("-");
            if (activeParts.length < 3)
                return; //Check if there is 3 parets (card) columnId, and CardID
            const sourceColId = activeParts[1]; //Column ID
            const cardId = activeParts.slice(2).join("-"); //Card ID
            if (overIdStr.startsWith("card-")) { //Check for the droppable area is card
                const overParts = overIdStr.split("-");
                if (overParts.length < 3)
                    return; //Check it's length (card, columnID and CardID)
                const destColId = overParts[1]; //Destination column
                let newIndex = 0; //New index
                if (over.data.current && typeof over.data.current.sortableIndex === "number") { // If the over element has sortable data (from dnd-kit) that provides an index, use it
                    newIndex = over.data.current.sortableIndex;
                }
                else {
                    // If not, try to compute the index by finding the target card's index within its column
                    const destColumn = board.columns.find((col) => col._id === destColId);
                    newIndex = destColumn
                        ? destColumn.cards.findIndex((card) => card._id === overParts.slice(2).join("-"))
                        : 0;
                }
                // Find the indices of the source and destination columns within the board's columns array
                const sourceColIndex = board.columns.findIndex((c) => c._id === sourceColId);
                const destColIndex = board.columns.findIndex((c) => c._id === destColId);
                // If either column cannot be found, exit early
                if (sourceColIndex === -1 || destColIndex === -1)
                    return;
                const sourceColumn = board.columns[sourceColIndex];
                const destColumn = board.columns[destColIndex];
                // Find the index of the card within the source column's cards
                const sourceCardIndex = sourceColumn.cards.findIndex((c) => c._id === cardId);
                if (sourceCardIndex === -1)
                    return;
                // Determine if the card is being moved within the same column or to a different column
                if (sourceColId === destColId) {
                    // If the card's current index is the same as the new index, no reordering is needed
                    if (sourceCardIndex === newIndex)
                        return;
                    const newCards = (0, sortable_1.arrayMove)(sourceColumn.cards, sourceCardIndex, newIndex);
                    try {
                        // Update the card order on the server by sending the new order of card IDs
                        const updated = await API.updateCardOrder(board._id, sourceColId, newCards.map((c) => c._id));
                        // Update the board state with the new column ordering
                        setBoard(updated);
                    }
                    catch (error) {
                        console.error(error);
                        alert("Error reordering cards.");
                    }
                }
                else {
                    // The card is being moved between different columns
                    // Adjust the new index for the destination column (default to 0 if the column is empty)
                    let newIndexAdjusted = newIndex;
                    if (!destColumn.cards.length) {
                        newIndexAdjusted = 0;
                    }
                    try {
                        // Call the API to move the card from the source column to the destination column
                        const updated = await API.moveCard(board._id, sourceColId, cardId, destColId, newIndexAdjusted);
                        setBoard(updated);
                    }
                    catch (error) {
                        console.error(error);
                        alert("Error moving card.");
                    }
                }
                // Handle the case where the card is dropped directly onto a column (not over a specific card)
            }
            else if (overIdStr.startsWith("col-")) {
                // Extract the destination column ID by removing the "col-" prefix
                const destColId = overIdStr.slice(4);
                // Find indices for the source and destination columns
                const sourceColIndex = board.columns.findIndex((col) => col._id === sourceColId);
                const destColIndex = board.columns.findIndex((col) => col._id === destColId);
                // If either column is not found, exit early
                if (sourceColIndex === -1 || destColIndex === -1)
                    return;
                // Retrieve the actual source and destination column objects
                const sourceColumn = board.columns[sourceColIndex];
                const destColumn = board.columns[destColIndex];
                // Find the index of the card in the source column
                const sourceCardIndex = sourceColumn.cards.findIndex((card) => card._id === cardId);
                // If the card is not found, exit early
                if (sourceCardIndex === -1)
                    return;
                // Determine the new index for the card in the destination column
                const newIndex = destColumn.cards.length;
                try {
                    const updated = await API.moveCard(board._id, sourceColId, cardId, destColId, newIndex);
                    setBoard(updated);
                }
                catch (error) {
                    console.error(error);
                    alert("Error moving card.");
                }
            }
        }
    };
    // If the board is not loaded, display a loading message
    if (!board)
        return (0, jsx_runtime_1.jsx)("div", { children: t("LoadingBoard", "Loading board...") });
    const displayedBoard = filteredBoard || board;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: "16px" }, children: [(0, jsx_runtime_1.jsx)(NavBar, {}), isEditingBoard ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: boardTitle, onChange: (e) => setBoardTitle(e.target.value), onBlur: finishEditingBoard, onKeyDown: (e) => {
                    if (e.key === "Enter")
                        finishEditingBoard();
                }, autoFocus: true, style: { fontSize: "2rem", marginTop: "1rem", textAlign: "center" } })) : ((0, jsx_runtime_1.jsx)("h1", { style: { marginTop: "1rem", textAlign: "center", cursor: "pointer" }, onDoubleClick: () => setIsEditingBoard(true), onTouchEnd: handleBoardDoubleTap, children: displayedBoard.title })), (0, jsx_runtime_1.jsxs)(core_1.DndContext, { sensors: sensors, collisionDetection: customCollisionDetection, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [(0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: displayedBoard.columns.map((col) => `col-${col._id}`), strategy: isMobile ? sortable_1.verticalListSortingStrategy : sortable_1.horizontalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { className: isMobile ? "kanban-board mobile" : "kanban-board desktop", children: displayedBoard.columns.map((column) => ((0, jsx_runtime_1.jsx)(ColumnComponent_1.default, { column: column, boardId: displayedBoard._id, refreshBoard: setBoard, showModal: setModal }, column._id))) }) }), (0, jsx_runtime_1.jsx)(core_1.DragOverlay, { children: activeId ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: "#ccc",
                                padding: "8px",
                                border: "1px solid #999",
                                width: 120,
                            }, children: ["Dragging ", activeId] })) : null })] }), modal] }));
};
exports.default = KanbanBoard;
