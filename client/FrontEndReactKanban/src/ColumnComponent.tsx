// ColumnComponent.tsx
import React, { useState } from "react";
//  Necessary functions and contexts for drag-and-drop
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardComponent from "./CardComponent";
//  API functions for column actions
import * as API from "./api";
//  Modal components for prompts
import { CardInputModal, ConfirmModal } from "./ModalPrompt";
import { useDoubleTap } from "./useDoubleTap";
import { useTranslation } from 'react-i18next';
import {  toast } from 'react-toastify';


// Interfaces for Card and Column objects

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


// Props interface for ColumnComponent

export interface ColumnProps {
  column: IColumn;
  boardId: string;
  refreshBoard: (board: any) => void;
  showModal: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

// ColumnComponent displays columns and cards in them.
const ColumnComponent: React.FC<ColumnProps> = ({ column, boardId, refreshBoard, showModal }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `col-${column._id}`,
  });


  //Define inline styles for drag
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  //State for editing the column title
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);


  //Finnish editing the column title and call API to change.
  const finishEditing = () => {
    if (editTitle.trim() !== "" && editTitle !== column.title) {
      API.renameColumn(boardId, column._id, editTitle)
        .then((updated) => refreshBoard(updated))
        .catch((error) => {
          console.error(error);
          toast.error("Error renaming column.");
        });
    }
    setIsEditing(false);
  };


  //Delete column via intial confirmation modal
  const handleDelete = async () => {
    showModal(
      <ConfirmModal
        message={t('HandleDeletionMessage', 'Do you want to delete this column?')}
        onConfirm={async () => {
          showModal(null);
          try {
            const updated = await API.deleteColumn(boardId, column._id);
            refreshBoard(updated);
          } catch (error) {
            console.error(error);
            toast.error("Error deleting column.");
          }
        }}
        onCancel={() => showModal(null)}
      />
    );
  };

  //Double-tap hook for mobile devices.
  const handleColumnDoubleTap = useDoubleTap(() => setIsEditing(true));


  //Adding new card to the column with modal
  const handleAddCard = async () => {
    showModal(
      <CardInputModal
        title={t('HandleModalInputCard', 'Add Card')}
        onConfirm={(cardTitle, cardDescription) => {
          showModal(null);
          if (!cardTitle.trim()) return;
          API.addCard(boardId, column._id, cardTitle, cardDescription)
            .then((updated) => refreshBoard(updated))
            .catch((error) => {
              console.error(error);
              toast.error("Error adding card.");
            });
        }}
        onCancel={() => showModal(null)}
      />
    );
  };




  return (
    <div className="column" ref={setNodeRef} style={style}>
      {/* Drag handle for the column */}
      <div className="column-drag-handle" {...attributes} {...listeners}>
        <span className="drag-icon" style={{ cursor: "grab" }}>☰</span>

      {/* Button to delete the column */}
        
        <button className="delete-column-btn" onClick={handleDelete}>{t('DeleteColumnButton', 'Delete Column')}</button>
      
      </div>

       {/* Column title with inline editing capability */}

      <div className="column-title" onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} onTouchEnd={handleColumnDoubleTap}>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={(e) => { if (e.key === "Enter") finishEditing(); }}
            autoFocus
          />
        ) : (
          <h3>{column.title}</h3>
        )}
      </div>


  {/* Button to add a new card */}
      <button className="add-card-btn" onClick={handleAddCard}>
      {t('AddCardButton', 'Add Card')}
      </button>


       {/* Set up the sortable context for the list of cards */}

      <SortableContext
        items={column.cards.map((card) => `card-${column._id}-${card._id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="cards">
          {column.cards.map((card) => (
            <CardComponent
              key={card._id}
              card={card}
              columnId={column._id}
              boardId={boardId}
              refreshBoard={refreshBoard}
              showModal={showModal}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default ColumnComponent;
