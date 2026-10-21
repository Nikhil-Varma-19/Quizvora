import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import "../ConfirmModal/ConfirmModal.css";
import "./Modal.css";

interface ModalProps {
  title: string;
  /** Omit to make the modal non-dismissable. */
  onClose?: () => void;
  children: ReactNode;
}

/** Centered dialog for forms. Rendered on document.body so it centers on the screen. */
export default function Modal({ title, onClose, children }: ModalProps) {
  return createPortal(
    <div className="confirm__backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h2 className="modal__title">{title}</h2>
          {onClose && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
