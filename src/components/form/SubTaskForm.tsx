import { useState } from "react";
import style from "./ProjectForm.module.scss";
import type { Subtask } from "../../types/projectTypes";
import { TASK_STATUS, TASK_STATUS_LABELS } from "../../types/projectTypes";

type Props = {
  onSubmit: (formData: Omit<Subtask, "id">) => void;
  initialData?: Partial<Subtask>;
};

const SubtaskForm = ({ onSubmit, initialData = {} }: Props) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [link, setLink] = useState(initialData?.link || "");
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [status, setStatus] = useState(
    initialData?.status || TASK_STATUS.PENDING
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      link,
      deadline,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <div className={style.formFields}>
        <div className={style.field}>
          <label className={style.label}>Название подзадачи</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={style.input}
            placeholder="Введите название подзадачи"
            required
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={style.textarea}
            placeholder="Введите описание подзадачи"
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Ссылка</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={style.input}
            placeholder="Введите ссылку"
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Дедлайн</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={style.input}
            required
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={style.select}
            required
          >
            {Object.entries(TASK_STATUS_LABELS).map(([key, value]) => (
              <option
                key={key}
                value={TASK_STATUS[key as keyof typeof TASK_STATUS]}
              >
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={style.formActions}>
        <button type="submit" className={style.button}>
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default SubtaskForm;
