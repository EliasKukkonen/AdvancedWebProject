// CardComponent.tsx
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable"; // DND kit
import { CSS } from "@dnd-kit/utilities"; // DND kit
import * as API from "./api";
import { InputModal, ConfirmModal } from "./ModalPrompt";
import { useDoubleTap } from "./useDoubleTap";
import { useTranslation } from 'react-i18next';
import {  toast } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css';

// Interface for card and comment
interface ICard {
  _id: string;
  title: string;
  description?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedCompletion?: Date | null;
}

interface IComment {
  _id: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

// Props interface for card
export interface CardProps {
  card: ICard;
  columnId: string;
  boardId: string;
  refreshBoard: (board: any) => void;
  showModal: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

// CardComponent displays and allows editing of a card
const CardComponent: React.FC<CardProps> = ({
  card,
  columnId,
  boardId,
  refreshBoard,
  showModal,
}) => {

  // Set up sortable drag-and-drop using dnd-kit hook
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `card-${columnId}-${card._id}`,
  });

  const { t } = useTranslation();

  // Inline style for drag transform and transition
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // Combined styles with a background color
  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: card.color || "#ffffff",
  };

  // Variables to manage editing modes
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || "");

  // State to manage comments and times
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [showEstimatedTime, setShowEstimatedTime] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");


  // Double-tap hooks for mobile
  const handleCardTitleDoubleTap = useDoubleTap(() => setIsEditingTitle(true));
  const handleCardDescriptionDoubleTap = useDoubleTap(() => setIsEditingDescription(true));

  // Function to finish editing the card title and call API
  const finishEditingTitle = () => {
    if (editTitle.trim() !== "" && editTitle !== card.title) {
      API.renameCard(boardId, columnId, card._id, editTitle, undefined)
        .then((updated) => refreshBoard(updated))
        .catch((error) => {
          console.error(error);
          toast.error("Error renaming card title.");
        });
    }
    setIsEditingTitle(false);
  };

  // Function to finish editing card description and call API
  const finishEditingDescription = () => {
    if (editDescription !== card.description) {
      API.renameCard(boardId, columnId, card._id, undefined, editDescription)
        .then((updated) => refreshBoard(updated))
        .catch((error) => {
          console.error(error);
          toast.error("Error renaming card description.");
        });
    }
    setIsEditingDescription(false);
  };

  // Update card color and call API
  async function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value;
    try {
      const updated = await API.updateCardColor(boardId, columnId, card._id, color);
      refreshBoard(JSON.parse(JSON.stringify(updated)));
    } catch (error: any) {
      console.error(error);
      toast.error("Error updating card color.");
    }
  }

  // Delete the card immediately without a modal.
  const handleDelete = async () => {
    try {
      const updated = await API.deleteCard(boardId, columnId, card._id);
      refreshBoard(JSON.parse(JSON.stringify(updated)));
    } catch (error: any) {
      console.error(error);
      toast.error("Error deleting card.");
    }
  };

  // Function to format timestamp string into local date/time
  const formatTimestamp = (ts?: string) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return date.toLocaleString();
  };

  // Show comments, with API call (fetch), if not already loaded
  async function handleToggleComments() {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      try {
        const fetched = await API.fetchComments(boardId, columnId, card._id);
        setComments(fetched);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch comments");
      }
    }
  }

  // Function to add comment to the card
  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      const updated = await API.addComment(boardId, columnId, card._id, newComment);
      setComments(updated);
      setNewComment("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
    }
  }

  // Handle the deletion of the comment, with modal confirmation
  async function handleDeleteComment(commentId: string) {
    showModal(
      <ConfirmModal
        message="Delete this comment?"
        onConfirm={async () => {
          showModal(null);
          try {
            const updated = await API.deleteComment(boardId, columnId, card._id, commentId);
            setComments(updated);
          } catch (error) {
            console.error(error);
            toast.error("Failed to delete comment");
          }
        }}
        onCancel={() => showModal(null)}
      />
    );
  }


  async function handleUpdateComment(commentId: string): Promise<void> {
    try {
      const updatedComment = await API.updateComment(boardId, columnId, card._id, commentId, editingCommentText);
      // Update local comment state
      const newComments = comments.map((com) =>
        com._id === commentId ? updatedComment : com
      );
      setComments(newComments);
      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success("Comment updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update comment");
    }
  }

  // Set estimated completion time using input modal
  const handleSetEstimatedTime = async () => {
    showModal(
      <InputModal
        title="Set Estimated Completion"
        label='Add in this format "YYYY-MM-DD":'
        onConfirm={async (time) => {
          showModal(null);
          const parsedDate = new Date(time);
          if (isNaN(parsedDate.getTime())) {
            toast.error("Invalid date format! Use YYYY-MM-DD.");
            return;
          }
          try {
            await API.setEstimatedTime(
              boardId,
              columnId,
              card._id,
              parsedDate.toISOString()
            );
            setEstimatedTime(parsedDate.toISOString());
          } catch (error) {
            console.error(error);
            toast.error("Failed to update estimated time.");
          }
        }}
        onCancel={() => showModal(null)}
      />
    );
  };

  // Function to remove estimated time after confirmation with modal
  const handleRemoveEstimatedTime = async () => {
    showModal(
      <ConfirmModal
        message="Remove estimated completion time?"
        onConfirm={async () => {
          showModal(null);
          try {
            await API.removeEstimatedTime(boardId, columnId, card._id);
            setEstimatedTime(null);
          } catch (error) {
            console.error(error);
            toast.error("Failed to remove estimated time.");
          }
        }}
        onCancel={() => showModal(null)}
      />
    );
  };

  // Toggle the display of estimated time and fetch it from API
  const handleToggleEstimation = async () => {
    setShowEstimatedTime(!showEstimatedTime);
    if (!showEstimatedTime) {
      try {
        const fetched = await API.fetchEstimatedTime(boardId, columnId, card._id);
        if (fetched?.estimatedCompletion) {
          const parsedDate = new Date(fetched.estimatedCompletion);
          if (!isNaN(parsedDate.getTime())) {
            setEstimatedTime(parsedDate.toISOString());
          } else {
            console.warn("Invalid date:", fetched.estimatedCompletion);
            setEstimatedTime(null);
          }
        } else {
          setEstimatedTime(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch estimated completion time.");
      }
    }
  };

  return (
    <div className="card" ref={setNodeRef} style={combinedStyle}>
      {/* Drag handle for the card */}
      <div
        className="card-drag-handle"
        {...attributes}
        {...listeners}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
      >
        <span className="drag-icon">☰</span>
      </div>
      {/* Card container including title and description */}
      <div className="card-content">
        <div
          // Double-click or double-tap to enable title editing
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditingTitle(true);
          }}
          onTouchEnd={handleCardTitleDoubleTap}
        >
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={finishEditingTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishEditingTitle();
              }}
              autoFocus
            />
          ) : (
            <h4>{card.title}</h4>
          )}
        </div>
        <div
          // Double-click or double-tap to enable card description editing
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditingDescription(true);
          }}
          onTouchEnd={handleCardDescriptionDoubleTap}
        >
          {isEditingDescription ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={finishEditingDescription}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishEditingDescription();
              }}
              autoFocus
            />
          ) : (
            <p>{card.description}</p>
          )}
        </div>
      </div>
  
      {/* Button to toggle the display of comments */}
      <button onClick={handleToggleComments}>
        {showComments
          ? t("HideCommentsText", "Hide Comments")
          : t("ShowCommentsOrAdd", "Show Comments or Add New Comment")}
      </button>
  
      {/* Render comments and controls for comments */}
      {showComments && (
        <div className="comments-container">
          <ul>
            {comments.map((com) => (
              <li
                key={com._id}
                className="comment-item"
                onDoubleClick={() => {
                  // Enable inline editing for this comment
                  setEditingCommentId(com._id);
                  setEditingCommentText(com.text);
                }}
              >
                <div className="comment-text">
                  {editingCommentId === com._id ? (
                    <input
                      type="text"
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      onBlur={() => handleUpdateComment(com._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateComment(com._id);
                      }}
                      autoFocus
                    />
                  ) : (
                    com.text
                  )}
                </div>
                <div className="comment-footer">
                  <small className="comment-date">
                    Created: {com.createdAt ? new Date(com.createdAt).toLocaleString() : ""}
                  </small>
                  <small className="comment-updated">
                    Updated: {com.updatedAt ? new Date(com.updatedAt).toLocaleString() : "Not updated"}
                  </small>
                  <button
                    onClick={() => handleDeleteComment(com._id)}
                    className="comment-delete-btn"
                  >
                    X
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* Input area for adding a new comment */}
          <div className="comment-input-container">
            <input
              type="text"
              placeholder={t("WriteCommentMessage", "Write a comment")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button onClick={handleAddComment} className="comment-add-btn">
              {t("AddCommentButton", "Add Comment")}
            </button>
          </div>
        </div>
      )}
  
      {/* Area for estimated completion time */}
      <div className="card-estimated-time">
        <button onClick={handleToggleEstimation}>
          {showEstimatedTime
            ? t("HideEstimatedTime", "Hide Estimated")
            : t("ShowEstimatedOrAdd", "Show Estimated Completion time or Add New")}
        </button>
        {showEstimatedTime && (
          <>
            <p>
              {t("EstimatedCompletionText", "Estimated Completion: ")}:{" "}
              {estimatedTime
                ? new Date(estimatedTime).toLocaleDateString()
                : t("NotSetText", "Not Set")}
            </p>
            <button onClick={handleSetEstimatedTime}>
              {t("SetEstimatedButton", "Set Estimated Time")}
            </button>
            {estimatedTime && (
              <button onClick={handleRemoveEstimatedTime}>
                {t("RemoveEstimated", "Remove")}
              </button>
            )}
          </>
        )}
      </div>
  
      {/* Controls for modifying card color */}
      <div className="card-controls">
        <label htmlFor="" className="card-handle-color">
          {t("ColorLabel", "Add Color")}:
        </label>
        <input
          type="color"
          value={card.color || "#ffffff"}
          className="color-picker"
          onChange={(e) => {
            e.stopPropagation();
            handleColorChange(e);
          }}
        />
      </div>
  
      {/* Button to delete the card */}
      <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
        {t("DeleteCardButton", "Delete Card")}
      </button>
  
      {/* Display timestamps for card creation and last update */}
      <div className="card-timestamps">
        <small className="timestamp">
          {t("CardCreatedStamp", "Card Created: ")} {formatTimestamp(card.createdAt)}
        </small>
        {" | "}
        <small className="timestamp">
          {t("CardUpdatedStamp", "Card Updated: ")} {formatTimestamp(card.updatedAt)}
        </small>
      </div>
    </div>
  );
  
  
};

export default CardComponent;
