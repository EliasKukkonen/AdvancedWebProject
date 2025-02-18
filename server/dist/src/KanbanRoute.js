"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Board_1 = __importDefault(require("./models/Board"));
const validateToken_1 = require("./middleware/validateToken");
const protectedRouter = (0, express_1.Router)();
/**
 * Helper function to check if the user can access a board.
 */
function canAccessBoard(board, user) {
    if (!user || !board.owner)
        return false;
    if (user.isAdmin)
        return true; //Admin is not used, deprecated
    // Compare the board owner with the user ID
    const userId = user._id || user.userId;
    return board.owner.toString() === userId.toString();
}
/**
 * Retrieve boards, return the board owned by the user.
 */
protectedRouter.get("/boards", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        console.log("Fetching board for user:", user);
        let board;
        if (user.isAdmin) { //Deprecated
            board = await Board_1.default.find().populate("owner", "email");
        }
        else {
            // Normal users can only have one board
            board = await Board_1.default.findOne({ owner: user.userId });
            if (!board) {
                board = new Board_1.default({
                    owner: user.userId,
                    title: "My Board", // Default title
                    columns: [],
                });
                await board.save();
            }
        }
        res.json([board]); // Send the board as an array for compatibility with front-end
    }
    catch (error) {
        console.error("Error fetching board:", error);
        res.status(500).json({ message: "Failed to fetch board." });
    }
});
/**
 * Creates a new board with the given title.
 */
protectedRouter.post("/boards", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        const { title } = req.body;
        if (!title) {
            res.status(400).json({ message: "Title is required." });
            return;
        }
        const newBoard = new Board_1.default({
            owner: user.userId,
            title,
            columns: [],
        });
        const savedBoard = await newBoard.save();
        // Return full board with ID
        res.status(201).json(await Board_1.default.findById(savedBoard._id));
    }
    catch (error) {
        res.status(500).json({ message: "Error creating board." });
    }
});
/**
 * Returns a single board if the user can access it.
 */
protectedRouter.get("/boards/:boardId", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        res.json(board);
    }
    catch (error) {
        console.error("Error fetching board:", error);
        res.status(500).json({ message: "Failed to fetch board" });
    }
});
/**
 * Updates a board title (rename).
 */
protectedRouter.put('/boards/:boardId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId } = req.params;
        const user = req.user;
        const { title } = req.body;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        // Rename the board
        if (title) {
            board.title = title;
        }
        await board.save();
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update board' });
    }
});
/**
 * Reorders the columns of a board based on the provided order.
 */
protectedRouter.put('/boards/:boardId/columns/order', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId } = req.params;
        const { columnOrder } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        // Reorder columns by mapping the provided order to the actual column objects.
        const reorderedColumns = columnOrder
            .map(colId => board.columns.find(col => col?._id?.toString() === colId))
            .filter((col) => col !== undefined);
        // Check that all columns are present.
        if (reorderedColumns.length !== board.columns.length) {
            res.status(400).json({ message: "Invalid column order" });
            return;
        }
        board.columns = reorderedColumns;
        await board.save();
        res.json(board);
    }
    catch (error) {
        console.error("Failed to update column order:", error);
        res.status(500).json({ message: "Failed to update column order" });
    }
});
/**
 * Reorders the cards within a column.
 */
protectedRouter.put('/boards/:boardId/columns/:colId/cards/order', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId } = req.params;
        const { cardOrder } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        // Find the column by its ID.
        const column = board.columns.find(col => col?._id?.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        // Reorder cards in the column by mapping the provided order to the actual card objects.
        const reorderedCards = cardOrder
            .map(cardId => column.cards.find(card => card?._id?.toString() === cardId))
            .filter((card) => card !== undefined);
        if (reorderedCards.length !== column.cards.length) {
            res.status(400).json({ message: "Invalid card order" });
            return;
        }
        column.cards = reorderedCards;
        await board.save();
        res.json(board);
    }
    catch (error) {
        console.error("Failed to update card order:", error);
        res.status(500).json({ message: "Failed to update card order" });
    }
});
/**
 * Deletes a board if the user is owner or admin.
 */
protectedRouter.delete('/boards/:boardId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(boardId)) {
            res.status(400).json({ message: 'Invalid board ID' });
            return;
        }
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        await board.deleteOne();
        res.json({ message: 'Board deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete board' });
    }
});
/**
 * Adds a new column to the specified board.
 */
protectedRouter.post('/boards/:boardId/columns', validateToken_1.authenticateUser, async (req, res) => {
    try {
        console.log("Received request to add column:", req.body);
        const { boardId } = req.params;
        const { title } = req.body;
        const user = req.user;
        if (!title) {
            res.status(400).json({ message: "Title is required." });
            return;
        }
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            console.error("Board not found for ID:", boardId);
            res.status(404).json({ message: "Board not found." });
            return;
        }
        if (!canAccessBoard(board, user)) {
            console.error("User does not have access to board:", user);
            res.status(403).json({ message: "Not allowed." });
            return;
        }
        board.columns.push({ title, cards: [] });
        await board.save();
        res.status(201).json(board);
    }
    catch (error) {
        console.error("Error adding column:", error);
        res.status(500).json({ message: "Failed to add column." });
    }
});
/**
 * Renames or updates a column.
 */
protectedRouter.put('/boards/:boardId/columns/:colId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId } = req.params;
        const { newTitle } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        // Find the column
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        // Update column title
        if (newTitle) {
            column.title = newTitle;
        }
        await board.save();
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to rename column' });
    }
});
/**
 * Removes a column
 */
protectedRouter.delete('/boards/:boardId/columns/:colId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        // Find index of the column to remove
        const colIndex = board.columns.findIndex((col) => col._id.toString() === colId);
        if (colIndex === -1) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        // Remove the column from the array
        board.columns.splice(colIndex, 1);
        await board.save();
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete column' });
    }
});
/**
 * Adds a new card to a column.
 */
protectedRouter.post('/boards/:boardId/columns/:colId/cards', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId } = req.params;
        const { title, description } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        // Locate the column within the board.
        const column = board.columns.find((col) => col._id?.toString() === colId);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        if (!title) {
            res.status(400).json({ message: "Card title is required" });
            return;
        }
        // Push the new card into the column's cards array.
        column.cards.push({ title, description, color: "#ffffff" });
        // Mark the 'cards' array as modified so Mongoose saves the change.
        board.markModified("columns");
        // Save the board.
        await board.save();
        res.status(201).json(board.toObject());
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add card' });
    }
});
/**
 * Updates a card (e.g., move, rename, change color).
 */
protectedRouter.put('/boards/:boardId/columns/:colId/cards/:cardId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const { newTitle, newDescription, color } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        // Find the column.
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        // Find the card.
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        // Update the card’s properties.
        if (newTitle)
            card.title = newTitle;
        if (newDescription)
            card.description = newDescription;
        if (color)
            card.color = color;
        await board.save();
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update card' });
    }
});
/**
 * Removes a card.
 */
protectedRouter.delete('/boards/:boardId/columns/:colId/cards/:cardId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        const cardIndex = column.cards.findIndex((c) => c._id.toString() === cardId);
        if (cardIndex === -1) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        column.cards.splice(cardIndex, 1);
        await board.save();
        res.json(board.toObject());
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete card' });
    }
});
/**
 * Moves a card from one column to another at a specified position.
 */
protectedRouter.put('/boards/:boardId/columns/:fromColId/cards/:cardId/move', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, fromColId, cardId } = req.params;
        const { newColumn: toColId, position } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(boardId) ||
            !mongoose_1.default.Types.ObjectId.isValid(fromColId) ||
            !mongoose_1.default.Types.ObjectId.isValid(toColId)) {
            res.status(400).json({ message: 'Invalid ID(s)' });
            return;
        }
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        const fromColumn = board.columns.find(col => col._id?.toString() === fromColId);
        const toColumn = board.columns.find(col => col._id?.toString() === toColId);
        if (!fromColumn || !toColumn) {
            res.status(404).json({ message: 'Source or target column not found' });
            return;
        }
        const cardIndex = fromColumn.cards.findIndex(card => card._id?.toString() === cardId);
        if (cardIndex === -1) {
            res.status(404).json({ message: 'Card not found in source column' });
            return;
        }
        const [card] = fromColumn.cards.splice(cardIndex, 1);
        if (position !== undefined && position >= 0 && position <= toColumn.cards.length) {
            toColumn.cards.splice(position, 0, card);
        }
        else {
            toColumn.cards.push(card);
        }
        await board.save();
        res.json(board);
    }
    catch (error) {
        console.error("Error moving card:", error);
        res.status(500).json({ message: 'Failed to move card' });
    }
});
/**
 * Retrieves all comments for a given card.
 */
protectedRouter.get("/boards/:boardId/columns/:colId/cards/:cardId/comments", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        res.json(card.comments);
    }
    catch (error) {
        console.error("Failed to fetch comments:", error);
        res.status(500).json({ message: "Failed to fetch comments" });
    }
});
/**
 * Adds a new comment to a card.
 */
protectedRouter.post("/boards/:boardId/columns/:colId/cards/:cardId/comments", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const { text } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        if (!text) {
            res.status(400).json({ message: "Comment text is required" });
            return;
        }
        card.comments ||= [];
        card.comments.push({ text });
        await board.save();
        res.status(201).json(card.comments);
    }
    catch (error) {
        console.error("Failed to add comment:", error);
        res.status(500).json({ message: "Failed to add comment" });
    }
});
/**
 * Removes a comment from a card.
 */
protectedRouter.delete("/boards/:boardId/columns/:colId/cards/:cardId/comments/:commentId", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId, commentId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        if (!card.comments) {
            card.comments = []; // Create an empty array if needed.
        }
        const commentIndex = card.comments.findIndex((com) => com._id.toString() === commentId);
        if (commentIndex === -1) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        card.comments.splice(commentIndex, 1);
        await board.save();
        res.json(card.comments);
    }
    catch (error) {
        console.error("Failed to delete comment:", error);
        res.status(500).json({ message: "Failed to delete comment" });
    }
});
/**
 * Sets the estimated completion time for a card.
 */
protectedRouter.put("/boards/:boardId/columns/:colId/cards/:cardId/estimated-time", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const { estimatedCompletion } = req.body;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        card.estimatedCompletion = estimatedCompletion ? new Date(estimatedCompletion) : null;
        await board.save();
        // Return the updated comments array 
        res.json(card.comments);
    }
    catch (error) {
        console.error("Failed to update estimated time:", error);
        res.status(500).json({ message: "Failed to update estimated time" });
    }
});
/**
 * Removes the estimated completion time from a card.
 */
protectedRouter.delete("/boards/:boardId/columns/:colId/cards/:cardId/estimated-time", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        card.estimatedCompletion = null;
        await board.save();
        res.json(card.comments);
    }
    catch (error) {
        console.error("Failed to remove estimated time:", error);
        res.status(500).json({ message: "Failed to remove estimated time" });
    }
});
/**
 * Retrieves the estimated completion time for a card.
 */
protectedRouter.get("/boards/:boardId/columns/:colId/cards/:cardId/estimated-time", validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId } = req.params;
        const user = req.user;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: "Card not found" });
            return;
        }
        res.json({ estimatedCompletion: card.estimatedCompletion || null });
    }
    catch (error) {
        console.error("Failed to fetch estimated completion time:", error);
        res.status(500).json({ message: "Failed to fetch estimated completion time" });
    }
});
/**
 * Updates a comment's text for a given card.
 * When updated, Mongoose's timestamps will update the `updatedAt` field automatically.
 */
protectedRouter.put('/boards/:boardId/columns/:colId/cards/:cardId/comments/:commentId', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { boardId, colId, cardId, commentId } = req.params;
        const { text } = req.body;
        const user = req.user;
        if (!text || typeof text !== 'string') {
            res.status(400).json({ message: 'Comment text is required.' });
            return;
        }
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        if (!canAccessBoard(board, user)) {
            res.status(403).json({ message: 'Not allowed' });
            return;
        }
        const column = board.columns.find((col) => col._id.toString() === colId);
        if (!column) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }
        const card = column.cards.find((c) => c._id.toString() === cardId);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        if (!card.comments) {
            card.comments = [];
        }
        const comment = card.comments.find((com) => com._id.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        // Update comment text; updatedAt will update automatically.
        comment.text = text;
        await board.save();
        res.json(comment);
    }
    catch (error) {
        console.error("Failed to update comment:", error);
        res.status(500).json({ message: "Failed to update comment" });
    }
});
exports.default = protectedRouter;
