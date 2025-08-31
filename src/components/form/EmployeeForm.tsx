import { useState } from "react";
import style from "./ProjectForm.module.scss";

type Props = {
  onSubmit: (formData: {
    name: string;
    position: string;
    projectsId: number[];
  }) => void;
  projects: { id: number; title: string }[];
  initialName?: string;
  initialPosition?: string;
  initialProjectsId?: number[];
};

const EmployeeForm = ({
  onSubmit,
  projects,
  initialName = "",
  initialPosition = "",
  initialProjectsId = [],
}: Props) => {
  const [name, setName] = useState(initialName);
  const [position, setPosition] = useState(initialPosition);
  const [projectsId, setProjectsId] = useState<number[]>(initialProjectsId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, position, projectsId });
  };

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <div className={style.formFields}>
        <div className={style.field}>
          <label className={style.label}>Имя сотрудника</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={style.input}
            placeholder="Введите имя сотрудника"
            required
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Название должности</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={style.input}
            placeholder="Введите должность"
            required
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Проекты</label>
          <div className={style.checkboxGroup}>
            {projects.map((project) => (
              <label key={project.id} className={style.checkbox}>
                <input
                  type="checkbox"
                  checked={projectsId.includes(project.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProjectsId([...projectsId, project.id]);
                    } else {
                      setProjectsId(
                        projectsId.filter((id) => id !== project.id)
                      );
                    }
                  }}
                />
                {project.title}
              </label>
            ))}
          </div>
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

export default EmployeeForm;
