import { useState } from "react";
import DataModal from "../modal/Modal";
import TaskForm from "../form/TaskForm";
import Icon from "../Icon";
import StatusBadge from "../StatusBadge";
import style from "../TeamWorks.module.scss";

import type { Task, Employee } from "../../types/projectTypes";
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
              <div className={style.task_status}>
                <StatusBadge status={task.status} />
              </div>
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
                <Icon name="edit" size={24} />
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
                <Icon name="delete" size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleOpenAdd}
        className={`${style.projects__column__item} ${style["projects__column__item--btn"]}`}
      >
        <Icon name="plus" size={20} />
        Добавить задачу
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
