import React from "react";
import { TASK_STATUS } from "../types/projectTypes";
import style from "./TeamWorks.module.scss";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return style.status_completed;
      case TASK_STATUS.IN_PROGRESS:
        return style.status_in_progress;
      case TASK_STATUS.PENDING:
        return style.status_pending;
      default:
        return style.status_default;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return "✓";
      case TASK_STATUS.IN_PROGRESS:
        return "▶";
      case TASK_STATUS.PENDING:
        return "⏳";
      default:
        return "•";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return "Завершена";
      case TASK_STATUS.IN_PROGRESS:
        return "В работе";
      case TASK_STATUS.PENDING:
        return "В ожидании";
      default:
        return status;
    }
  };

  return (
    <span
      className={`${style.status_badge} ${getStatusColor(status)} ${className}`}
    >
      <span className={style.status_icon}>{getStatusIcon(status)}</span>
      <span className={style.status_text}>{getStatusLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;
