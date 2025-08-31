import { useState } from "react";
import type {
  Project,
  Employee,
  Task,
  Documentation,
  Subtask,
  ModalType,
  ModalMode,
} from "../types/projectTypes";

const useModal = <
  T extends Project | Employee | Task | Documentation | Subtask
>() => {
  const [isOpen, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("add");
  const [type, setType] = useState<ModalType | null>(null);
  const [data, setData] = useState<T | null>(null);

  const open = (modalType: ModalType, modalMode: ModalMode, item?: T) => {
    setType(modalType);
    setMode(modalMode);
    setData(item ?? null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setType(null);
    setData(null);
  };

  return { isOpen, mode, type, data, open, close };
};

export default useModal;
