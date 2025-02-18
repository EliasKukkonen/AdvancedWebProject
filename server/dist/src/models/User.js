"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//User schema
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: { type: Boolean, default: false }, //Not implemented but stays active
});
exports.default = (0, mongoose_1.model)('User', userSchema);
