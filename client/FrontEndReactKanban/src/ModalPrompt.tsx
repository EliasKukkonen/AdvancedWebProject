// ModalPrompt.tsx
import React, { useState } from "react";
import "./ModalPrompt.css";
import { useTranslation } from 'react-i18next';

// Props for InputModal
export interface InputModalProps {
  title: string;
  label?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}


//Modal that prompts the user to input a value
export const InputModal: React.FC<InputModalProps> = ({
  
  title,
  label,
  defaultValue,
  onConfirm,
  onCancel,
}) => {

  // Local state to manage the current input value
  const [value, setValue] = useState(defaultValue || "");
  const { t } = useTranslation();
  return (

    //Overlay for the modal
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        {label && <label>{label}</label>}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={() => onConfirm(value)}>{t('OKModal', 'OK')}</button>
          <button onClick={onCancel}>{t('CancelModal', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
};


//Props for the the confirmation modal
export interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}


//Component for confirmation modal (YES/NO)
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    //Overlay
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm}>{t('YESModal', 'YES')}</button>
          <button onClick={onCancel}>{t('NOModal', 'NO')}</button>
        </div>
      </div>
    </div>
  );
};



//Specific modal for the card input, props.
export interface CardInputModalProps {
  title: string;
  onConfirm: (cardTitle: string, cardDescription: string) => void;
  onCancel: () => void;
}
//Specific modal for the card input, component.
export const CardInputModal: React.FC<CardInputModalProps> = ({
  title,
  onConfirm,
  onCancel,
}) => {

  //Sets the card title and card desrciption
  const { t } = useTranslation();
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  return (

    //Overlay
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <label>{t('CardTitleModalPrompt', 'Card Title')}</label>
        <input
          type="text"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          autoFocus
        />
        <label>{t('CardDescriptionModalPromt', 'Card Description (optional)')}:</label>
        <input
          type="text"
          value={cardDescription}
          onChange={(e) => setCardDescription(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={() => onConfirm(cardTitle, cardDescription)}>OK</button>
          <button onClick={onCancel}>{t('CancelCardButtonModal', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
};
