// frontend/src/api.ts
//This is a file with all APIs that frontend uses, for connection to the backend and database

//Base URL
const BASE_URL = "http://localhost:3000/api";



//Get Token Function to retrieve token from local storage and give access to the kanban Board For registered users.
async function getToken(): Promise<string> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not logged in");
  return token;
}


//Fetching the boards, with authorization token.
export async function fetchBoards() {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch boards");
  return await res.json();
}


//A function to automatically create a board for the new user.
export async function createBoard(title: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create board");
  return await res.json();
}


//Function for updating boardtitle, utilized in doubleclick board name change.
export async function updateBoardTitle(boardId: string, title: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update board title");
  return await res.json();
}

//API for column order in the database. Function is active when column order is changed
//Saves the column order into the DB and Backend 
export async function updateColumnOrder(boardId: string, columnOrder: string[]) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ columnOrder }),
  });
  if (!res.ok) throw new Error("Failed to update column order");
  return await res.json();
}


//Same as previous function but for cards. Saves order of cards, active when card order is changed inside or outside the column.
//Saves the order of cards in DB and Backend
export async function updateCardOrder(boardId: string, colId: string, cardOrder: string[]) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cardOrder }),
  });
  if (!res.ok) throw new Error("Failed to update card order");
  return await res.json();
}


//API route for the adding column. Used to add new column to the board.
//Takes board (boardID) and adds a column to it
export async function addColumn(boardId: string, title: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to add column");
  return await res.json();
}

//Rename function to the column, active when renaiming the columns with double-click.
//Uses column id to find right board
//Saves in backend and DB
export async function renameColumn(boardId: string, colId: string, newTitle: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newTitle }),
  });
  if (!res.ok) throw new Error("Failed to rename column");
  return await res.json();
}


//Function to delete column.
//Uses column id and boardID to find right board from DB
export async function deleteColumn(boardId: string, colId: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete column");
  return await res.json();
}



//Add card function.
//Uses boardID, Column ID to add to right board and right column.
export async function addCard(boardId: string, colId: string, title: string, description?: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to add card");
  return await res.json();
}


//Rename card function.
//Checks if newTitle and newDescription has anything
//Used in the double click function
export async function renameCard(
  boardId: string,
  colId: string,
  cardId: string,
  newTitle?: string,
  newDescription?: string
) {
  const token = await getToken();
  const body: any = {};
  if (newTitle !== undefined) body.newTitle = newTitle;
  if (newDescription !== undefined) body.newDescription = newDescription;
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update card");
  return await res.json();
}


//Used to update the card color.
//Uses boardId, columnID, CardID to find right card from DB
//Updates the color, default (white)
export async function updateCardColor(boardId: string, colId: string, cardId: string, color: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ color }),
  });
  if (!res.ok) throw new Error("Failed to update card color");
  return await res.json();
}



//Delete card function.
//Uses boardID, ColumnID, CardID to find right card from DB
export async function deleteCard(boardId: string, colId: string, cardId: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete card");
  return await res.json();
}


//Movind card function, used while drag and drop functionality, used to move cards around.
//Uss boardID, columID, cardID to move card around saves new position in DB
export async function moveCard(
  boardId: string,
  fromColId: string,
  cardId: string,
  toColId: string,
  position: number
) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${fromColId}/cards/${cardId}/move`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newColumn: toColId, position }),
  });
  if (!res.ok) throw new Error("Failed to move card");
  return await res.json();
}





// Fetching all comments of the card
//Uses board, column and cardID, to find all comments
export async function fetchComments(boardId: string, colId: string, cardId: string) {
  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/comments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch comments");
  return await res.json(); // Expecting an array of comments
}

// Adding new comment to the card.
//Uses board, column and cardID, to find all comments
//Saves in DB
export async function addComment(boardId: string, colId: string, cardId: string, text: string) {
  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    }
  );
  if (!res.ok) throw new Error("Failed to add comment");
  return await res.json(); // Could return the updated card.comments array
}

// Deleting comment from card.
//Uses board, column and cardID, and commentID to find the right comment from DB
export async function deleteComment(
  boardId: string,
  colId: string,
  cardId: string,
  commentId: string
) {
  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to delete comment");
  return await res.json(); // Could return the updated card.comments array
}


//Estimation time for the cards.
//Search with boardID, columnID, cardID and then sets the time
export async function setEstimatedTime(boardId: string, colId: string, cardId: string, estimatedCompletion: string | null) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/estimated-time`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estimatedCompletion }),
  });
  if (!res.ok) throw new Error("Failed to update estimated time");
  return await res.json();
}

//Deletes the estimated time
export async function removeEstimatedTime(boardId: string, colId: string, cardId: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/estimated-time`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove estimated time");
  return await res.json();
}


//Get all (1) estimated time for the card.
//Uses fetch
export async function fetchEstimatedTime(boardId: string, colId: string, cardId: string) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/estimated-time`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch estimated time");
  return await res.json();
}


//Function to rename a board
export async function renameBoard(boardId: string, title: string) {
  const token = await getToken(); // Get the token from localStorage
  const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token here
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json();
}

//Update comment function.
export async function updateComment(
  boardId: string,
  colId: string,
  cardId: string,
  commentId: string,
  newText: string
): Promise<any> {
  const token = await getToken();
  const response = await fetch(
    `${BASE_URL}/boards/${boardId}/columns/${colId}/cards/${cardId}/comments/${commentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({ text: newText }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error updating comment");
  }
  return await response.json();
}
