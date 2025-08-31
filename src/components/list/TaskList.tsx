import { useState } from "react";
import DataModal from "../modal/Modal";
import TaskForm from "../form/TaskForm";
import style from "../TeamWorks.module.scss";

import type { Task, Employee } from "../../types/projectTypes";
import { TASK_STATUS_LABELS } from "../../types/projectTypes";
import { formatDate, isOverdue } from "../../utils/dateUtils";

interface Props {
  tasks: Task[];
  employees: Employee[]; // Добавляем список сотрудников для отображения имен
  selectedEmployee: Employee | null; // Добавляем текущего сотрудника
  selectedTask: Task | null;
  onSelect: (task: Task) => void;
  onAdd: (
    data: Omit<Task, "id" | "employeeIds" | "projectId" | "subtasks">
  ) => void;
  onEdit: (
    task: Task,
    data: Omit<Task, "id" | "employeeIds" | "projectId" | "subtasks">
  ) => void;
  onDelete: (taskId: number) => void;
}

const TaskList = ({
  tasks,
  employees,
  selectedEmployee,
  selectedTask,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleOpenAdd = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleSubmit = (
    formData: Omit<Task, "id" | "employeeIds" | "projectId" | "subtasks">
  ) => {
    if (editTask) {
      onEdit(editTask, formData);
    } else {
      onAdd(formData);
    }
    setModalOpen(false);
  };

  const getItemStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return style["projects__column__item--completed"];
      case "in_progress":
        return style["projects__column__item--in-progress"];
      case "pending":
        return style["projects__column__item--pending"];
      default:
        return style["projects__column__item--pending"];
    }
  };

  return (
    <div
      className={`${style.projects__column} ${style["projects__column--task"]}`}
    >
      <div className={style.projects__column__header}>
        <h3>Задачи</h3>
      </div>

      <div className={style["projects__column__items-container"]}>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelect(task)}
            onDoubleClick={() => handleOpenEdit(task)}
            className={`${style.projects__column__item} ${
              selectedTask?.id === task.id
                ? style["projects__column__item--selected"]
                : ""
            } ${
              isOverdue(task.deadline)
                ? style["projects__column__item--overdue"]
                : getItemStatusClass(task.status)
            }`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                  type: "task",
                  taskId: task.id,
                  taskData: task,
                })
              );
              e.dataTransfer.effectAllowed = "copy";
            }}
          >
            <div className={`${style["projects__column__item--task"]}`}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              {task.link && (
                <a href={task.link} target="_blank" rel="noopener noreferrer">
                  Ссылка
                </a>
              )}
              <p className={isOverdue(task.deadline) ? style.overdue : ""}>
                Крайний срок: {formatDate(task.deadline)}
              </p>
              <p>
                Статус:{" "}
                {TASK_STATUS_LABELS[
                  task.status as keyof typeof TASK_STATUS_LABELS
                ] || task.status}
              </p>
              <div className={style.task_assignees}>
                <strong>Исполнители:</strong>
                <div className={style.assignees_list}>
                  {task.employeeIds.map((empId) => {
                    const employee = employees.find((emp) => emp.id === empId);
                    const isCurrentEmployee = selectedEmployee?.id === empId;
                    return (
                      <span
                        key={empId}
                        className={`${style.assignee_tag} ${
                          isCurrentEmployee ? style.assignee_tag_current : ""
                        }`}
                      >
                        {employee?.name || `ID: ${empId}`}
                        {isCurrentEmployee && " (вы)"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={`${style.projects__column__item__controll}`}>
              <button onClick={() => handleOpenEdit(task)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-edit"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                title={
                  selectedEmployee &&
                  task.employeeIds.includes(selectedEmployee.id)
                    ? task.employeeIds.length === 1
                      ? "Выйти из задачи (задача будет удалена)"
                      : "Выйти из задачи"
                    : "Недоступно (вы не участвуете в задаче)"
                }
                disabled={
                  !selectedEmployee ||
                  !task.employeeIds.includes(selectedEmployee.id)
                }
                className={
                  !selectedEmployee ||
                  !task.employeeIds.includes(selectedEmployee.id)
                    ? style.button_disabled
                    : ""
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-log-out"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleOpenAdd}
        className={`${style.projects__column__item} ${style["projects__column__item--btn"]}`}
      >
        + Добавить задачу
      </button>

      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTask ? "Редактирование задачи" : "Создание задачи"}
        data={editTask}
      >
        {() => (
          <TaskForm
            onSubmit={handleSubmit}
            initialData={editTask || undefined}
          />
        )}
      </DataModal>
    </div>
  );
};

export default TaskList;
