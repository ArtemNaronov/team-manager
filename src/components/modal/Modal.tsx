// src/components/DataModal/DataModal.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./DataModal.scss";

interface DataModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data?: T | null;
  title?: string | ((data: T) => string);
  children: (data: T) => React.ReactNode;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const DataModal = <T,>({
  isOpen,
  onClose,
  data,
  title,
  children,
  closeOnOverlayClick = true,
  showCloseButton = true,
}: DataModalProps<T>) => {
  // Закрытие при нажатии Escape и управление скроллом body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // Блокируем скролл body при открытом модальном окне
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      // Восстанавливаем скролл body при закрытии модального окна
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {typeof title === "function" && data
              ? title(data)
              : (title as string) || ""}
          </h2>

          {showCloseButton && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>

        <div className="modal-body">{children?.(data as T)}</div>
      </div>
    </div>
  );

  // Рендерим модальное окно в корне документа
  return createPortal(modalContent, document.body);
};

export default DataModal;
