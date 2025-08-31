export interface Project {
  id: number;
  title: string;
  documentation: Documentation[];
}

export interface Documentation {
  id: number;
  title: string;
  url: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  projectsId: number[];
}

export interface Subtask {
  id: number;
  title: string;
  description: string;
  link: string;
  deadline: string;
  status: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  link: string;
  deadline: string;
  status: string;
  employeeIds: number[]; // Изменено с employeeId на массив employeeIds
  projectId: number;
  subtasks: Subtask[];
}

export type ModalType =
  | "project"
  | "employee"
  | "task"
  | "document"
  | "settings";

export type ModalMode = "add" | "edit";

export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  mode: ModalMode;
  data?: Project | Employee | Task | Documentation | Subtask; // Данные для редактирования
}

// Константы для статусов задач
export const TASK_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  PENDING: "pending",
} as const;

export const TASK_STATUS_LABELS: Record<keyof typeof TASK_STATUS, string> = {
  COMPLETED: "Завершена",
  IN_PROGRESS: "В работе",
  PENDING: "В ожидании",
};

export type TaskStatusType = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
