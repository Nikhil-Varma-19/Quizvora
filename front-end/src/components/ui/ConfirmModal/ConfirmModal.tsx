import { createPortal } from "react-dom";
import Button from "../Button/Button";
import "./ConfirmModal.css";

interface ConfirmModalProps {
  title: string;
  message?: string;
  confirmLabel: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Centered confirm dialog. Rendered on document.body so it centers on the screen, not a parent. */
export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return createPortal(
    <div className="confirm__backdrop" onClick={() => !loading && onCancel()}>
      <div
        className="confirm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="confirm__title">{title}</h2>
        {message && <p className="muted">{message}</p>}
        <div className="confirm__actions">
          <Button variant="secondary" size="sm" block={false} disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            block={false}
            loading={loading}
            loadingText="Please wait..."
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
