"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./src/index"));
const KanbanRoute_1 = __importDefault(require("./src/KanbanRoute"));
dotenv_1.default.config({
    path: path_1.default.join(__dirname, '..', '..', '.env'),
});
const app = (0, express_1.default)();
// Use the environment PORT if available, otherwise default to 3000
const port = parseInt(process.env.PORT) || 3000;
// Connect to MongoDB
const mongoDB = "mongodb://127.0.0.1:27017/KanBanDb";
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.log.bind(console, "MongoDB connection error"));
// In development, enable CORS so requests from the frontend dev server are allowed.
if (process.env.NODE_ENV === 'development') {
    app.use((0, cors_1.default)({
        origin: 'http://localhost:5173',
        credentials: true,
    }));
}
app.use(express_1.default.json());
app.use('/', index_1.default);
app.use('/api', KanbanRoute_1.default);
// In production, serve the built React app.
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path_1.default.join(__dirname, '..', '..', 'client', 'FrontEndReactKanban', 'dist');
    console.log("Serving frontend from:", clientBuildPath);
    // Serve static files
    app.use(express_1.default.static(clientBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(clientBuildPath, 'index.html'));
    });
}
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
