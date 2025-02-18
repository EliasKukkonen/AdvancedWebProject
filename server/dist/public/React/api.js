"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBoards = fetchBoards;
exports.createBoard = createBoard;
exports.updateBoardTitle = updateBoardTitle;
exports.updateColumnOrder = updateColumnOrder;
exports.updateCardOrder = updateCardOrder;
exports.addColumn = addColumn;
exports.renameColumn = renameColumn;
exports.deleteColumn = deleteColumn;
exports.addCard = addCard;
exports.renameCard = renameCard;
exports.updateCardColor = updateCardColor;
exports.deleteCard = deleteCard;
exports.moveCard = moveCard;
// frontend/src/api.ts
const BASE_URL = "http://localhost:3000/api";
async function getToken() {
    const token = localStorage.getItem("token");
    if (!token)
        throw new Error("Not logged in");
    return token;
}
async function fetchBoards() {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
        throw new Error("Failed to fetch boards");
    return await res.json();
}
async function createBoard(title) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
    });
    if (!res.ok)
        throw new Error("Failed to create board");
    return await res.json();
}
async function updateBoardTitle(boardId, title) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
    });
    if (!res.ok)
        throw new Error("Failed to update board title");
    return await res.json();
}
async function updateColumnOrder(boardId, columnOrder) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/order`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columnOrder }),
    });
    if (!res.ok)
        throw new Error("Failed to update column order");
    return await res.json();
}
async function updateCardOrder(boardId, colId, cardOrder) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/order`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardOrder }),
    });
    if (!res.ok)
        throw new Error("Failed to update card order");
    return await res.json();
}
async function addColumn(boardId, title) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
    });
    if (!res.ok)
        throw new Error("Failed to add column");
    return await res.json();
}
async function renameColumn(boardId, colId, newTitle) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newTitle }),
    });
    if (!res.ok)
        throw new Error("Failed to rename column");
    return await res.json();
}
async function deleteColumn(boardId, colId) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
        throw new Error("Failed to delete column");
    return await res.json();
}
async function addCard(boardId, colId, title, description) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
    });
    if (!res.ok)
        throw new Error("Failed to add card");
    return await res.json();
}
async function renameCard(boardId, colId, cardId, newTitle, newDescription) {
    const token = await getToken();
    const body = {};
    if (newTitle !== undefined)
        body.newTitle = newTitle;
    if (newDescription !== undefined)
        body.newDescription = newDescription;
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error("Failed to update card");
    return await res.json();
}
async function updateCardColor(boardId, colId, cardId, color) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color }),
    });
    if (!res.ok)
        throw new Error("Failed to update card color");
    return await res.json();
}
async function deleteCard(boardId, colId, cardId) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
        throw new Error("Failed to delete card");
    return await res.json();
}
async function moveCard(boardId, fromColId, cardId, toColId, position) {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${fromColId}/cards/${cardId}/move`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newColumn: toColId, position }),
    });
    if (!res.ok)
        throw new Error("Failed to move card");
    return await res.json();
}
