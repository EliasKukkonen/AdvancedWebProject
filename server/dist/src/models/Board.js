"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//Schema for comments
const commentSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    // createdAt is automatically set via timestamps
}, { _id: true,
    timestamps: true,
});
//Card schema
const cardSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: "#ffffff" },
    comments: { type: [commentSchema], default: [] },
    estimatedCompletion: { type: Date, default: null },
}, { _id: true,
    timestamps: true
});
//Column schema
const columnSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    cards: { type: [cardSchema], default: [] },
}, { _id: true });
//Schema for boards.
const boardSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "My Board" },
    columns: { type: [columnSchema], default: [] },
}, {
    timestamps: true, //  Track when board is created
});
exports.default = (0, mongoose_1.model)("Board", boardSchema);
