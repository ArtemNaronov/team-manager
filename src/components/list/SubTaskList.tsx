import { useState, useRef } from "react";
import DataModal from "../modal/Modal";
import SubTaskForm from "../form/SubTaskForm";
import Icon from "../Icon";
import style from "../TeamWorks.module.scss";

import type { Task, Subtask } from "../../types/projectTypes";

interface Props {
  selectedTask: Task;
  onAdd: (data: Omit<Subtask, "id">) => void;
  onEdit: (subtaskId: number, data: Omit<Subtask, "id">) => void;
  onDelete?: (subtaskId: number) => void;
  onReorder?: (subtaskIds: number[]) => void; // Добавляем возможность пере排序
}

type StatusKeys = "completed" | "in_progress" | "pending";
type TaskStatus = Record<StatusKeys, string>;

const SubTaskList = ({
  selectedTask,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubtask, setEditSubtask] = useState<Subtask | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [quickActions, setQuickActions] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleOpenAdd = () => {
    setEditSubtask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (subtask: Subtask) => {
    setEditSubtask(subtask);
    setModalOpen(true);
  };

  const handleDelete = (subtaskId: number) => {
    if (
      onDelete &&
      window.confirm("Вы уверены, что хотите удалить эту подзадачу?")
    ) {
      onDelete(subtaskId);
    }
  };

  const handleQuickStatusChange = (subtaskId: number, newStatus: string) => {
    const subtask = selectedTask.subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      onEdit(subtaskId, { ...subtask, status: newStatus });
    }
    setQuickActions(null);
  };

  const handleDragStart = (e: React.DragEvent, subtaskId: number) => {
    setDraggedItem(subtaskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId && onReorder) {
      const subtasks = [...selectedTask.subtasks];
      const draggedIndex = subtasks.findIndex((s) => s.id === draggedItem);
      const targetIndex = subtasks.findIndex((s) => s.id === targetId);

      const [draggedSubtask] = subtasks.splice(draggedIndex, 1);
      subtasks.splice(targetIndex, 0, draggedSubtask);

      onReorder(subtasks.map((s) => s.id));
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSubmit = (formData: Omit<Subtask, "id">) => {
    if (editSubtask) {
      onEdit(editSubtask.id, formData);
    } else {
      onAdd(formData);
    }
    setModalOpen(false);
  };

  const statusList: TaskStatus = {
    completed: "Завершена",
    in_progress: "В работе",
    pending: "В ожидании",
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return style["status-completed"];
      case "in_progress":
        return style["status-in_progress"];
      case "pending":
        return style["status-pending"];
      default:
        return style["status-pending"];
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "in_progress":
        return "⟳";
      case "pending":
        return "⏳";
      default:
        return "⏳";
    }
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== "completed";
  };

  return (
    <div
      className={`${style.projects__column} ${style["projects__column--subtask"]}`}
    >
      <div className={style.projects__column__header}>
        <h3>Подзадачи</h3>
      </div>

      <div className={style["projects__column__items-container"]}>
        {selectedTask.subtasks.length > 0 && (
          <div className={style.subtasks_list}>
            {selectedTask.subtasks.map((subtask, index) => (
              <div
                key={subtask.id}
                className={`${style.projects__column__item} ${
                  draggedItem === subtask.id
                    ? style["projects__column__item--dragging"]
                    : ""
                } ${
                  isOverdue(subtask.deadline, subtask.status)
                    ? style["projects__column__item--overdue"]
                    : getItemStatusClass(subtask.status)
                }`}
                onDoubleClick={() => handleOpenEdit(subtask)}
                draggable={!!onReorder}
                onDragStart={(e) => handleDragStart(e, subtask.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, subtask.id)}
                onDragEnd={handleDragEnd}
                ref={dragRef}
              >
                <div className={style.drag_handle}>
                  <Icon name="status" size={16} />
                </div>

                <div className={`${style["projects__column__item--task"]}`}>
                  <div className={style.task_header}>
                    <strong>{subtask.title}</strong>
                    <div className={style.task_meta}>
                      <span className={style.task_number}>#{index + 1}</span>
                      {isOverdue(subtask.deadline, subtask.status) && (
                        <span className={style.overdue_badge}>Просрочено</span>
                      )}
                    </div>
                  </div>

                  <p>{subtask.description}</p>

                  {subtask.link && (
                    <a
                      href={subtask.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={style.task_link}
                    >
                      <Icon name="documentation" size={14} />
                      Ссылка
                    </a>
                  )}

                  <div className={style.task_footer}>
                    <div className={style.deadline_info}>
                      <Icon name="calendar" size={14} />
                      <span
                        className={
                          isOverdue(subtask.deadline, subtask.status)
                            ? style.overdue
                            : ""
                        }
                      >
                        {subtask.deadline}
                      </span>
                    </div>

                    <div
                      className={`${style.status} ${getStatusClass(
                        subtask.status
                      )}`}
                      onClick={() =>
                        setQuickActions(
                          quickActions === subtask.id ? null : subtask.id
                        )
                      }
                    >
                      <span className={style.status_icon}>
                        {getStatusIcon(subtask.status)}
                      </span>
                      {statusList[subtask.status as StatusKeys]}

                      {quickActions === subtask.id && (
                        <div className={style.quick_actions}>
                          {Object.entries(statusList).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() =>
                                handleQuickStatusChange(subtask.id, key)
                              }
                              className={`${style.quick_action} ${
                                subtask.status === key
                                  ? style["quick_action--active"]
                                  : ""
                              }`}
                            >
                              {getStatusIcon(key)} {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={style.task_actions}>
                  <button
                    onClick={() => handleOpenEdit(subtask)}
                    title="Редактировать подзадачу"
                    className={`${style.task_action} ${style["task_action--edit"]}`}
                  >
                    <Icon name="edit" size={16} />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => handleDelete(subtask.id)}
                    title="Удалить подзадачу"
                    className={`${style.task_action} ${style["task_action--delete"]}`}
                  >
                    <Icon name="delete" size={16} />
                    <span>Удалить</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleOpenAdd}
        className={`${style.projects__column__item} ${style["projects__column__item--btn"]}`}
      >
        <Icon name="plus" size={20} />
        Добавить подзадачу
      </button>

      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editSubtask ? "Редактирование подзадачи" : "Создание подзадачи"}
        data={editSubtask}
      >
        {() => (
          <SubTaskForm
            onSubmit={handleSubmit}
            initialData={editSubtask || undefined}
          />
        )}
      </DataModal>
    </div>
  );
};

export default SubTaskList;
