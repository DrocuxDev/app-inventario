import { useEffect, useId, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  open,
  onClose,
  title,
  badge,
  size = "md",
  isDirty = false,
  initialFocusRef,
  footer,
  children,
}) => {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    onCloseRef.current = onClose;
    isDirtyRef.current = isDirty;
  });

  useEffect(() => {
    if (!open) return undefined;

    triggerRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const container = dialogRef.current;
      if (!container) return;
      const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (isDirtyRef.current) {
          const discard = window.confirm("Tienes cambios sin guardar. ¿Deseas descartarlos y cerrar?");
          if (!discard) return;
        }
        onCloseRef.current?.();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return;
    if (isDirty) {
      const discard = window.confirm("Tienes cambios sin guardar. ¿Deseas descartarlos y cerrar?");
      if (!discard) return;
    }
    onClose?.();
  };

  const sizeClass = size === "sm" ? "ui-modal-sm" : size === "lg" ? "ui-modal-lg" : "ui-modal-md";

  return (
    <div className="ui-modal-backdrop" onMouseDown={handleBackdropClick}>
      <div
        ref={dialogRef}
        className={`ui-modal ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
      >
        <div className="ui-modal-header">
          <div className="ui-modal-title-group">
            <h2 id={titleId} className="ui-modal-title">
              {title}
            </h2>
            {badge}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar diálogo"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div id={bodyId} className="ui-modal-body">
          {children}
        </div>

        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}) => {
  const cancelBtnRef = useRef(null);
  const btnClass =
    variant === "danger"
      ? "btn-danger-ui"
      : variant === "warning"
      ? "btn-primary-ui"
      : "btn-primary-ui";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocusRef={cancelBtnRef}
      footer={
        <>
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn-ui btn-secondary-ui"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn-ui ${btnClass}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-dialog-content">
        <div className={`confirm-dialog-icon ${variant}`} aria-hidden="true">
          <AlertTriangle size={20} strokeWidth={1.75} />
        </div>
        <div>{description}</div>
      </div>
    </Modal>
  );
};

export default Modal;
