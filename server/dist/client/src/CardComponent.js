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
// CardComponent.tsx
const react_1 = require("react");
const sortable_1 = require("@dnd-kit/sortable"); //DND kit
const utilities_1 = require("@dnd-kit/utilities"); //DND kit
const API = __importStar(require("./api"));
const ModalPrompt_1 = require("./ModalPrompt");
const useDoubleTap_1 = require("./useDoubleTap");
const react_i18next_1 = require("react-i18next");
// CardComponent displays and allows editing of card
const CardComponent = ({ card, columnId, boardId, refreshBoard, showModal, }) => {
    //Set up sortable drag-and-drop using dnd-kit hook
    const { attributes, listeners, setNodeRef, transform, transition } = (0, sortable_1.useSortable)({
        id: `card-${columnId}-${card._id}`,
    });
    const { t } = (0, react_i18next_1.useTranslation)();
    //Inline style for drag transform and transition
    const style = {
        transform: utilities_1.CSS.Transform.toString(transform),
        transition,
    };
    //Combined styles with a background color
    const combinedStyle = {
        ...style,
        backgroundColor: card.color || "#ffffff",
    };
    //Variables to manage editing modes
    const [isEditingTitle, setIsEditingTitle] = (0, react_1.useState)(false);
    const [isEditingDescription, setIsEditingDescription] = (0, react_1.useState)(false);
    const [editTitle, setEditTitle] = (0, react_1.useState)(card.title);
    const [editDescription, setEditDescription] = (0, react_1.useState)(card.description || "");
    //State to manage commennts and times
    const [showComments, setShowComments] = (0, react_1.useState)(false);
    const [comments, setComments] = (0, react_1.useState)([]);
    const [showEstimatedTime, setShowEstimatedTime] = (0, react_1.useState)(false);
    const [estimatedTime, setEstimatedTime] = (0, react_1.useState)(null);
    const [newComment, setNewComment] = (0, react_1.useState)("");
    //Double-tap hooks for mobile
    const handleCardTitleDoubleTap = (0, useDoubleTap_1.useDoubleTap)(() => setIsEditingTitle(true));
    const handleCardDescriptionDoubleTap = (0, useDoubleTap_1.useDoubleTap)(() => setIsEditingDescription(true));
    //Function to finish editing the card title and call API
    const finishEditingTitle = () => {
        if (editTitle.trim() !== "" && editTitle !== card.title) {
            API.renameCard(boardId, columnId, card._id, editTitle, undefined)
                .then((updated) => refreshBoard(updated))
                .catch((error) => {
                console.error(error);
                alert("Error renaming card title.");
            });
        }
        setIsEditingTitle(false);
    };
    //Function to finish editing card description and call API
    const finishEditingDescription = () => {
        if (editDescription !== card.description) {
            API.renameCard(boardId, columnId, card._id, undefined, editDescription)
                .then((updated) => refreshBoard(updated))
                .catch((error) => {
                console.error(error);
                alert("Error renaming card description.");
            });
        }
        setIsEditingDescription(false);
    };
    //Update card color and call API
    async function handleColorChange(e) {
        const color = e.target.value;
        try {
            const updated = await API.updateCardColor(boardId, columnId, card._id, color);
            refreshBoard(JSON.parse(JSON.stringify(updated)));
        }
        catch (error) {
            console.error(error);
            alert("Error updating card color.");
        }
    }
    // Delete the card immediately without a modal.
    const handleDelete = async () => {
        try {
            const updated = await API.deleteCard(boardId, columnId, card._id);
            refreshBoard(JSON.parse(JSON.stringify(updated)));
        }
        catch (error) {
            console.error(error);
            alert("Error deleting card.");
        }
    };
    //Function to format timestamp string into local date/time
    const formatTimestamp = (ts) => {
        if (!ts)
            return "N/A";
        const date = new Date(ts);
        return date.toLocaleString();
    };
    //Show comments, with API call (fetch), if not already loaded
    async function handleToggleComments() {
        setShowComments(!showComments);
        if (!showComments && comments.length === 0) {
            try {
                const fetched = await API.fetchComments(boardId, columnId, card._id);
                setComments(fetched);
            }
            catch (error) {
                console.error(error);
                alert("Failed to fetch comments");
            }
        }
    }
    //Function to add comment to the card
    async function handleAddComment() {
        if (!newComment.trim())
            return;
        try {
            const updated = await API.addComment(boardId, columnId, card._id, newComment);
            setComments(updated);
            setNewComment("");
        }
        catch (error) {
            console.error(error);
            alert("Failed to add comment");
        }
    }
    //Handle the deletion of the comment, with modal confirmation
    async function handleDeleteComment(commentId) {
        showModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.ConfirmModal, { message: "Delete this comment?", onConfirm: async () => {
                showModal(null);
                try {
                    const updated = await API.deleteComment(boardId, columnId, card._id, commentId);
                    setComments(updated);
                }
                catch (error) {
                    console.error(error);
                    alert("Failed to delete comment");
                }
            }, onCancel: () => showModal(null) }));
    }
    //Set estimated completion time using input modal
    const handleSetEstimatedTime = async () => {
        showModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.InputModal, { title: "Set Estimated Completion", label: 'Add in this format "YYYY-MM-DD":', onConfirm: async (time) => {
                showModal(null);
                const parsedDate = new Date(time);
                if (isNaN(parsedDate.getTime())) {
                    alert("Invalid date format! Use YYYY-MM-DD.");
                    return;
                }
                try {
                    await API.setEstimatedTime(boardId, columnId, card._id, parsedDate.toISOString());
                    setEstimatedTime(parsedDate.toISOString());
                }
                catch (error) {
                    console.error(error);
                    alert("Failed to update estimated time.");
                }
            }, onCancel: () => showModal(null) }));
    };
    //Function to remove estimated time after the intial confirmation with modal
    const handleRemoveEstimatedTime = async () => {
        showModal((0, jsx_runtime_1.jsx)(ModalPrompt_1.ConfirmModal, { message: "Remove estimated completion time?", onConfirm: async () => {
                showModal(null);
                try {
                    await API.removeEstimatedTime(boardId, columnId, card._id);
                    setEstimatedTime(null);
                }
                catch (error) {
                    console.error(error);
                    alert("Failed to remove estimated time.");
                }
            }, onCancel: () => showModal(null) }));
    };
    //Togglle the display of the estimated time and fetch estimated time from API call
    const handleToggleEstimation = async () => {
        setShowEstimatedTime(!showEstimatedTime);
        if (!showEstimatedTime) {
            try {
                const fetched = await API.fetchEstimatedTime(boardId, columnId, card._id);
                if (fetched?.estimatedCompletion) {
                    const parsedDate = new Date(fetched.estimatedCompletion);
                    if (!isNaN(parsedDate.getTime())) {
                        setEstimatedTime(parsedDate.toISOString());
                    }
                    else {
                        console.warn("Invalid date:", fetched.estimatedCompletion);
                        setEstimatedTime(null);
                    }
                }
                else {
                    setEstimatedTime(null);
                }
            }
            catch (error) {
                console.error(error);
                alert("Failed to fetch estimated completion time.");
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card", ref: setNodeRef, style: combinedStyle, children: [(0, jsx_runtime_1.jsx)("div", { className: "card-drag-handle", ...attributes, ...listeners, onDoubleClick: (e) => {
                    e.stopPropagation();
                }, children: (0, jsx_runtime_1.jsx)("span", { className: "drag-icon", children: "\u2630" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card-content", children: [(0, jsx_runtime_1.jsx)("div", { 
                        //Double click or double-tap to enable title editing
                        onDoubleClick: (e) => {
                            e.stopPropagation();
                            setIsEditingTitle(true);
                        }, onTouchEnd: handleCardTitleDoubleTap, children: isEditingTitle ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editTitle, onChange: (e) => setEditTitle(e.target.value), onBlur: finishEditingTitle, onKeyDown: (e) => { if (e.key === "Enter")
                                finishEditingTitle(); }, autoFocus: true })) : ((0, jsx_runtime_1.jsx)("h4", { children: card.title })) }), (0, jsx_runtime_1.jsx)("div", { 
                        //Double click or double-tap to enable card description editing
                        onDoubleClick: (e) => {
                            e.stopPropagation();
                            setIsEditingDescription(true);
                        }, onTouchEnd: handleCardDescriptionDoubleTap, children: isEditingDescription ? ((0, jsx_runtime_1.jsx)("textarea", { value: editDescription, onChange: (e) => setEditDescription(e.target.value), onBlur: finishEditingDescription, onKeyDown: (e) => { if (e.key === "Enter")
                                finishEditingDescription(); }, autoFocus: true })) : ((0, jsx_runtime_1.jsx)("p", { children: card.description })) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleToggleComments, children: showComments ? t("HideCommentsText", "Hide Comments") : t("ShowCommentsOrAdd", "Show Comments or Add New Comment") }), showComments && ((0, jsx_runtime_1.jsxs)("div", { className: "comments-container", children: [(0, jsx_runtime_1.jsx)("ul", { children: comments.map((com) => ((0, jsx_runtime_1.jsxs)("li", { className: "comment-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "comment-text", children: com.text }), (0, jsx_runtime_1.jsxs)("div", { className: "comment-footer", children: [(0, jsx_runtime_1.jsx)("small", { className: "comment-date", children: com.createdAt ? new Date(com.createdAt).toLocaleString() : "" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteComment(com._id), className: "comment-delete-btn", children: "X" })] })] }, com._id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "comment-input-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: t('WriteCommentMessage', 'Write a comment'), value: newComment, onChange: (e) => setNewComment(e.target.value), className: "comment-input" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleAddComment, className: "comment-add-btn", children: t('AddCommentButton', 'Add Comment') })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "card-estimated-time", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleToggleEstimation, children: showEstimatedTime ? t("HideEstimatedTime", "Hide Estimated") : t("ShowEstimatedOrAdd", "Show Estimated Completion time or Add New") }), showEstimatedTime && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("p", { children: [t('EstimatedCompletionText', 'Estimated Completion: '), ":", " ", estimatedTime
                                        ? new Date(estimatedTime).toLocaleDateString()
                                        : t("NotSetText", "Not Set")] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSetEstimatedTime, children: t('SetEstimatedButton', 'Set Estimated Time') }), estimatedTime && ((0, jsx_runtime_1.jsx)("button", { onClick: handleRemoveEstimatedTime, children: t('RemoveEstimated', 'Remove') }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "card-controls", children: [(0, jsx_runtime_1.jsxs)("label", { htmlFor: "", className: "card-handle-color", children: [t('ColorLabel', 'Add Color'), ":"] }), (0, jsx_runtime_1.jsx)("input", { type: "color", value: card.color || "#ffffff", className: "color-picker", onChange: (e) => { e.stopPropagation(); handleColorChange(e); } })] }), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => { e.stopPropagation(); handleDelete(); }, children: t('DeleteCardButton', 'Delete Card') }), (0, jsx_runtime_1.jsxs)("div", { className: "card-timestamps", children: [(0, jsx_runtime_1.jsxs)("small", { className: "timestamp", children: [t('CardCreatedStamp', 'Card Created: '), " ", formatTimestamp(card.createdAt)] }), " ", "|", " ", (0, jsx_runtime_1.jsxs)("small", { className: "timestamp", children: [t('CardUpdatedStamp', 'Card Updated: '), " ", formatTimestamp(card.updatedAt)] })] })] }));
};
exports.default = CardComponent;
