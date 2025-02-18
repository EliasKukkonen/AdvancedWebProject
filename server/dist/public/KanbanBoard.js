"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const core_1 = require("@dnd-kit/core");
const sortable_1 = require("@dnd-kit/sortable");
const sortable_2 = require("@dnd-kit/sortable");
const Column = ({ column, children }) => {
    // Use dnd-kit’s sortable hook for columns themselves
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, sortable_2.useSortable)({ id: column.id });
    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
        // Basic styling:
        minWidth: 250,
        background: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
        margin: '0 8px',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: [(0, jsx_runtime_1.jsx)("h3", { style: { cursor: 'grab', marginTop: 0 }, children: column.title }), children] }));
};
const Card = ({ card }) => {
    // Use dnd-kit’s sortable hook for each card
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, sortable_2.useSortable)({ id: card.id });
    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
        // Basic styling:
        background: card.color || '#ffffff',
        border: '1px solid #ddd',
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
        cursor: 'grab',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '4px 0' }, children: card.title }), card.description && (0, jsx_runtime_1.jsx)("p", { children: card.description })] }));
};
// ============ Main KanbanBoard ============
const KanbanBoard = () => {
    // Example data
    const [board, setBoard] = (0, react_1.useState)({
        id: 'board-1',
        title: 'Example Board',
        columns: [
            {
                id: 'col-1',
                title: 'To Do',
                cards: [
                    { id: 'card-1', title: 'Task 1' },
                    { id: 'card-2', title: 'Task 2' },
                ],
            },
            {
                id: 'col-2',
                title: 'In Progress',
                cards: [{ id: 'card-3', title: 'Task 3' }],
            },
            {
                id: 'col-3',
                title: 'Done',
                cards: [{ id: 'card-4', title: 'Task 4' }],
            },
        ],
    });
    // Track which item is currently being dragged
    // so we can render a drag overlay
    const [activeId, setActiveId] = (0, react_1.useState)(null);
    // We also might need to track “is it a column or a card?”
    // One approach is to look for the item in columns or cards by ID.
    function findColumnById(id) {
        return board.columns.find((col) => col.id === id);
    }
    function findCardById(id) {
        for (const column of board.columns) {
            const card = column.cards.find((c) => c.id === id);
            if (card)
                return { card, colId: column.id };
        }
        return null;
    }
    const activeCardData = activeId ? findCardById(activeId)?.card : null;
    const activeColumnData = activeId ? findColumnById(activeId) : null;
    // =========== DndContext callbacks ===========
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };
    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over)
            return;
        const activeItemId = active.id;
        const overItemId = over.id;
        // Is the active item a column or a card?
        const activeColumn = findColumnById(activeItemId);
        const activeCard = findCardById(activeItemId);
        const overColumn = findColumnById(overItemId);
        const overCard = findCardById(overItemId);
        // If we are dragging a column over another column, reorder columns:
        if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
            // We’ll reorder the columns in onDragEnd, so we can skip here
            // or do an “intermediate reorder” if we want. 
            return;
        }
        // If we are dragging a card over a card or over a column
        if (activeCard) {
            // For example, if we want to do live “on the fly” insertion logic, 
            // we can do that here. But often we just do final reorder in onDragEnd.
        }
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) {
            // Dropped outside any droppable
            setActiveId(null);
            return;
        }
        const activeItemId = active.id;
        const overItemId = over.id;
        const activeColumn = findColumnById(activeItemId);
        const overColumn = findColumnById(overItemId);
        const activeCard = findCardById(activeItemId);
        const overCard = findCardById(overItemId);
        // 1) Reordering columns
        if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
            // We have columns array
            const oldIndex = board.columns.findIndex((c) => c.id === activeColumn.id);
            const newIndex = board.columns.findIndex((c) => c.id === overColumn.id);
            const newColumns = (0, sortable_1.arrayMove)(board.columns, oldIndex, newIndex);
            setBoard({ ...board, columns: newColumns });
        }
        // 2) Reordering or moving cards
        if (activeCard) {
            const fromColId = activeCard.colId;
            const toColId = overCard ? overCard.colId : overColumn?.id;
            if (!toColId) {
                // Dropped somewhere not recognized
                setActiveId(null);
                return;
            }
            // If same column, reorder
            if (fromColId === toColId && overCard) {
                const column = board.columns.find((c) => c.id === fromColId);
                if (column) {
                    const oldIndex = column.cards.findIndex((c) => c.id === activeCard.card.id);
                    const newIndex = column.cards.findIndex((c) => c.id === overCard.card.id);
                    const newCards = (0, sortable_1.arrayMove)(column.cards, oldIndex, newIndex);
                    const newCols = board.columns.map((col) => col.id === fromColId ? { ...col, cards: newCards } : col);
                    setBoard({ ...board, columns: newCols });
                }
            }
            else {
                // Moving to different column
                const fromColIndex = board.columns.findIndex((col) => col.id === fromColId);
                const toColIndex = board.columns.findIndex((col) => col.id === toColId);
                if (fromColIndex === -1 || toColIndex === -1) {
                    setActiveId(null);
                    return;
                }
                const fromColumn = board.columns[fromColIndex];
                const toColumn = board.columns[toColIndex];
                // Remove card from source
                const cardIndex = fromColumn.cards.findIndex((c) => c.id === activeCard.card.id);
                const [movedCard] = fromColumn.cards.splice(cardIndex, 1);
                // Insert into target
                if (overCard) {
                    const overIndex = toColumn.cards.findIndex((c) => c.id === overCard.card.id);
                    toColumn.cards.splice(overIndex, 0, movedCard);
                }
                else {
                    // If dropping into an empty column
                    toColumn.cards.push(movedCard);
                }
                // Update state
                const newColumns = [...board.columns];
                newColumns[fromColIndex] = { ...fromColumn };
                newColumns[toColIndex] = { ...toColumn };
                setBoard({ ...board, columns: newColumns });
            }
        }
        setActiveId(null);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: board.title }), (0, jsx_runtime_1.jsxs)(core_1.DndContext, { collisionDetection: core_1.closestCenter, onDragStart: handleDragStart, onDragOver: handleDragOver, onDragEnd: handleDragEnd, children: [(0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: board.columns.map((c) => c.id), strategy: sortable_1.horizontalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'row', overflowX: 'auto' }, children: board.columns.map((col) => (
                            // Column is a droppable area, plus a Sortable item
                            (0, jsx_runtime_1.jsx)(Column, { column: col, children: (0, jsx_runtime_1.jsx)(sortable_1.SortableContext, { items: col.cards.map((card) => card.id), strategy: sortable_1.verticalListSortingStrategy, children: (0, jsx_runtime_1.jsx)("div", { style: { minHeight: 50 }, children: col.cards.map((card) => ((0, jsx_runtime_1.jsx)(Card, { card: card, columnId: col.id }, card.id))) }) }) }, col.id))) }) }), (0, jsx_runtime_1.jsx)(core_1.DragOverlay, { children: activeId ? (
                        // If it's a card, show Card, if it's a column, show Column
                        activeCardData ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: activeCardData.color || '#ffffff',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                padding: 8,
                                maxWidth: 200,
                            }, children: [(0, jsx_runtime_1.jsx)("h4", { children: activeCardData.title }), activeCardData.description && (0, jsx_runtime_1.jsx)("p", { children: activeCardData.description })] })) : activeColumnData ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                minWidth: 250,
                                background: '#f0f0f0',
                                borderRadius: 8,
                                padding: 8,
                            }, children: (0, jsx_runtime_1.jsx)("h3", { children: activeColumnData.title }) })) : null) : null })] })] }));
};
exports.default = KanbanBoard;
