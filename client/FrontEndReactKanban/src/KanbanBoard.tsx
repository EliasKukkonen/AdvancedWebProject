
import React, { useEffect, useState, KeyboardEvent } from "react";
import { ToastContainer, toast } from 'react-toastify'; 
// Dnd-kit core components and events for drag-and-drop
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  TouchSensor,
  PointerSensor,
} from "@dnd-kit/core";
// Import sortable context and helpers for handling sorting
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
//API for the api calls
import * as API from "./api";
import ColumnComponent from "./ColumnComponent";
import "./KanbanBoard.css";
import { useMediaQuery } from "react-responsive";

// Import modal components and double-tap hook
import { InputModal } from "./ModalPrompt";
import { useDoubleTap } from "./useDoubleTap";

import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Import the i18n instance


// Define interfaces for card, column, and board 

interface ICard {
  _id: string;
  title: string;
  description?: string;
  color?: string;
}

interface IColumn {
  _id: string;
  title: string;
  cards: ICard[];
}

interface IBoard {
  _id: string;
  title: string;
  columns: IColumn[];
}


// Main KanbanBoard component that renders the board and handles drag-and-drop
const KanbanBoard: React.FC = () => {
  const { t } = useTranslation();

   // State for the current board, active drag item, search term, and filtered board view
  const [board, setBoard] = useState<IBoard | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoard, setFilteredBoard] = useState<IBoard | null>(null);
  // Modal state
  const [modal, setModal] = useState<React.ReactNode>(null);
  // State for editing the board title
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");


  //Check for mobile device
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Sensors for drag-and-drop with specific activation parameters
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } })
  );


  //Language change function
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      console.log("Language changed to", lng);
    });
  };

  // Custom collision detection when dragging columns.
  const customCollisionDetection = (args: any) => {
    const { active } = args;
    if (typeof active.id === "string" && active.id.startsWith("col-")) {
      return pointerWithin(args);
    }
    return closestCenter(args);
  };

  // For board title double-tap on touch devices:
  const handleBoardDoubleTap = useDoubleTap(() => setIsEditingBoard(true));

  // Navigation bar component for saerch, adding columns, and logout and language functionality
  const NavBar: React.FC = () => {
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);


    //Logout, removing the token and boardID from local storage (BoardID is as well stored in the DB)
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("currentBoardId")
      window.location.reload();
    };

    //Add new column via modal prompt
    const handleAddColumn = () => {
      setModal(
        <InputModal
          title={t("columnMessage", "Add column name")}
          label={t("columnMessage2", "Add column name")}
          onConfirm={(value) => {
            setModal(null);
            if (!value.trim()) return;
            API.addColumn(board!._id, value)
              .then((updated: IBoard) => setBoard(updated))
              .catch((error) => {
                console.error(error);
                toast.error("Error adding column.");
              });
          }}
          onCancel={() => setModal(null)}
        />
      );
    };


    //Handle search to filter out cards. When filtered only cards are shown which are searched with the columns where these types of cards are.
    const handleSearch = () => {
      if (!board) return;
      setSearchTerm(tempSearchTerm);
      if (!tempSearchTerm.trim()) {
        setFilteredBoard(null);
        return;
      }
      const lower = tempSearchTerm.toLowerCase();
      const filteredColumns = board.columns
        .map((col) => {
          const newCards = col.cards.filter(
            (card) =>
              card.title.toLowerCase().includes(lower) ||
              (card.description || "").toLowerCase().includes(lower)
          );
          return { ...col, cards: newCards };
        })
        .filter((col) => col.cards.length > 0);
      const newBoard = { ...board, columns: filteredColumns };
      setFilteredBoard(newBoard);
    };





    return (
      //Navigation bar with languages
      <nav className="navbar">
        <div className="navbar-left">
          <input
            type="text"
            placeholder={t('searchButtonPlaceholder', 'Search')}
            value={tempSearchTerm}
            onChange={(e) => setTempSearchTerm(e.target.value)}
            className="navbar-search-input"
          />
          <button onClick={handleSearch} className="navbar-search-btn">
          {t('searchButton', 'Search')}
          </button>
        </div>
        <div className="navbar-right">
          <button onClick={handleAddColumn} className="navbar-btn">
          {t('AddColumnButton', 'Add Column')}
          </button>
          <button onClick={handleLogout} className="navbar-btn">
          {t('LogoutButton', 'Logout')}
          </button>
           {/* Language switcher buttons in the NavBar */}
        <button onClick={() => changeLanguage('en')}>Eng</button>
        <button onClick={() => changeLanguage('fi')}>Fin</button>
        </div>
      </nav>
    );
  };

  // Load board the board data from API when component is active
  useEffect(() => {
    async function loadBoard() {
      try {
        const boards: IBoard[] = await API.fetchBoards();
        if (boards.length > 0) {
          const selected = boards[0];

          //Ensure that columns are empty arrays
          const normalizedBoard = { ...selected, columns: selected.columns || [] };
          setBoard(normalizedBoard);
          setBoardTitle(normalizedBoard.title);
          localStorage.setItem("currentBoardId", normalizedBoard._id);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadBoard();
  }, []);

  // Function to finish editing board title and call API
  const finishEditingBoard = async () => {
    if (!board) return;
    if (boardTitle.trim() !== "" && boardTitle !== board.title) {
      try {
        const updated = await API.renameBoard(board._id, boardTitle);
        setBoard(updated);
      } catch (error) {
        console.error(error);
        toast.error("Error renaming board.");
      }
    }
    setIsEditingBoard(false);
  };

  //Activate the drag item when dragging starts
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };



  //Handle drag and events to update column or card order via API call.
  //After dragging cards have new position in the DB, the API call does it.
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    if (!board) return;
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();
  
    // Handle column drag-and-drop
    if (activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
      const oldIndex = board.columns.findIndex((c) => `col-${c._id}` === activeIdStr); //Old index (ID) before dragging
      const newIndex = board.columns.findIndex((c) => `col-${c._id}` === overIdStr); //New index after the drag
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const newColumns = arrayMove(board.columns, oldIndex, newIndex);
      try {
  
        //Set new order
        const updated: IBoard = await API.updateColumnOrder(
          board._id,
          newColumns.map((c) => c._id)
        );
        setBoard(updated);
      } catch (error) {
        console.error(error);
        toast.error("Error reordering columns.");
      }
      return;
    }
  
    // Handle card drag-and-drop
  
    if (activeIdStr.startsWith("card-")) { //Check if the draggable item is card
      const activeParts = activeIdStr.split("-");
      if (activeParts.length < 3) return; //Check if there is 3 parets (card) columnId, and CardID
      const sourceColId = activeParts[1]; //Column ID
      const cardId = activeParts.slice(2).join("-"); //Card ID
      if (overIdStr.startsWith("card-")) { //Check for the droppable area is card
        const overParts = overIdStr.split("-");
        if (overParts.length < 3) return; //Check it's length (card, columnID and CardID)
        const destColId = overParts[1]; //Destination column
        let newIndex = 0; //New index
        if (over.data.current && typeof over.data.current.sortableIndex === "number") { // If the over element has sortable data (from dnd-kit) that provides an index, use it
          newIndex = over.data.current.sortableIndex;
        } else {
           // If not, try to compute the index by finding the target card's index within its column
          const destColumn = board.columns.find((col) => col._id === destColId);
          newIndex = destColumn
            ? destColumn.cards.findIndex((card) => card._id === overParts.slice(2).join("-"))
            : 0;
          // NEW CODE: If newIndex is -1, compute newIndex based on vertical drop position.
          if (newIndex === -1 && destColumn && over.rect) {
            // Calculate the relative drop position (0 to 1) within the bounding rect
            const relativeDropPosition = (event.delta.y + over.rect.top - over.rect.top) / over.rect.height;
            // Multiply by the number of cards to get an approximate index
            newIndex = Math.floor(relativeDropPosition * destColumn.cards.length);
            // Clamp newIndex to valid range
            if (newIndex < 0) newIndex = 0;
            if (newIndex > destColumn.cards.length) newIndex = destColumn.cards.length;
          }
        }
  
        // Find the indices of the source and destination columns within the board's columns array
        const sourceColIndex = board.columns.findIndex((c) => c._id === sourceColId);
        const destColIndex = board.columns.findIndex((c) => c._id === destColId);
        // If either column cannot be found, exit early
        if (sourceColIndex === -1 || destColIndex === -1) return;
        const sourceColumn = board.columns[sourceColIndex];
        const destColumn = board.columns[destColIndex];
        // Find the index of the card within the source column's cards
        const sourceCardIndex = sourceColumn.cards.findIndex((c) => c._id === cardId);
        if (sourceCardIndex === -1) return;
        // Determine if the card is being moved within the same column or to a different column
        if (sourceColId === destColId) {
          // If the card's current index is the same as the new index, no reordering is needed
          if (sourceCardIndex === newIndex) return;
          const newCards = arrayMove(sourceColumn.cards, sourceCardIndex, newIndex);
          try {
            // Update the card order on the server by sending the new order of card IDs
            const updated: IBoard = await API.updateCardOrder(
              board._id,
              sourceColId,
              newCards.map((c) => c._id)
            );
            // Update the board state with the new column ordering
            setBoard(updated);
          } catch (error) {
            console.error(error);
            toast.error("Error reordering cards.");
          }
        } else {
          // The card is being moved between different columns
          // Adjust the new index for the destination column (default to 0 if the column is empty)
          let newIndexAdjusted = newIndex;
          if (!destColumn.cards.length) {
            newIndexAdjusted = 0;
          }
          try {
            // Call the API to move the card from the source column to the destination column
            const updated: IBoard = await API.moveCard(
              board._id,
              sourceColId,
              cardId,
              destColId,
              newIndexAdjusted
            );
            setBoard(updated);
          } catch (error) {
            console.error(error);
            toast.error("Error moving card.");
          }
        }
        // Handle the case where the card is dropped directly onto a column (not over a specific card)
      } else if (overIdStr.startsWith("col-")) {
        // Extract the destination column ID by removing the "col-" prefix
        const destColId = overIdStr.slice(4);
        // Find indices for the source and destination columns
        const sourceColIndex = board.columns.findIndex((col) => col._id === sourceColId);
        const destColIndex = board.columns.findIndex((col) => col._id === destColId);
        // If either column is not found, exit early
        if (sourceColIndex === -1 || destColIndex === -1) return;
        // Retrieve the actual source and destination column objects
        const sourceColumn = board.columns[sourceColIndex];
        const destColumn = board.columns[destColIndex];
        // Find the index of the card in the source column
        const sourceCardIndex = sourceColumn.cards.findIndex((card) => card._id === cardId);
        // If the card is not found, exit early
        if (sourceCardIndex === -1) return;
        // Determine the new index for the card in the destination column
        const newIndex = destColumn.cards.length;
        try {
          const updated: IBoard = await API.moveCard(
            board._id,
            sourceColId,
            cardId,
            destColId,
            newIndex
          );
          setBoard(updated);
        } catch (error) {
          console.error(error);
          toast.error("Error moving card.");
        }
      }
    }
  };
// If the board is not loaded, display a loading message
  if (!board) return <div>{t("LoadingBoard", "Loading board...")}</div>;
  const displayedBoard = filteredBoard || board;

  return (
    <div style={{ padding: "16px" }}>
        {/* Navigation bar */}
      <NavBar />
      {/* Board Title */}
      {isEditingBoard ? (
        <input
          type="text"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          onBlur={finishEditingBoard}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") finishEditingBoard();
          }}
          autoFocus
          style={{ fontSize: "2rem", marginTop: "1rem", textAlign: "center" }}
        />
      ) : (
        <h1
          style={{ marginTop: "1rem", textAlign: "center", cursor: "pointer" }}
          onDoubleClick={() => setIsEditingBoard(true)}
          onTouchEnd={handleBoardDoubleTap}
        >
          {displayedBoard.title}
        </h1>
      )}
        {/* DndContext wraps the draggable elements */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
         {/* SortableContext for columns */}
        <SortableContext
          items={displayedBoard.columns.map((col) => `col-${col._id}`)}
          strategy={isMobile ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          <div className={isMobile ? "kanban-board mobile" : "kanban-board desktop"}>
              {/* Render each column */}
            {displayedBoard.columns.map((column) => (
              <ColumnComponent
                key={column._id}
                column={column}
                boardId={displayedBoard._id}
                refreshBoard={setBoard}
                showModal={setModal}
              />
            ))}
          </div>
        </SortableContext>
         {/* DragOverlay: shows a preview of the item being dragged */}
        <DragOverlay>
          {activeId ? (
            <div
              style={{
                background: "#ccc",
                padding: "8px",
                border: "1px solid #999",
                width: 120,
              }}
            >
              Dragging {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
       <ToastContainer position="bottom-center" autoClose={5000} /> 
      {modal}
    </div>
  );
};

export default KanbanBoard;
