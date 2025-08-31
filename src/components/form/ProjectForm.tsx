import { useState } from "react";
import style from "./ProjectForm.module.scss";
import type { Employee } from "../../types/projectTypes";

type Props = {
  onSubmit: (formData: { title: string; employeeId: number[] | [] }) => void;
  employees: Employee[];
  initialData?: { title: string; employeeId: number[] } | null;
};

const ProjectForm = ({ onSubmit, employees, initialData = null }: Props) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [search, setSearch] = useState("");
  const [employeeId, setEmployeeId] = useState<number[]>(
    initialData?.employeeId || []
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, employeeId });
  };

  const handleEmployeeIdToggle = (emp: Employee) => {
    setEmployeeId((prevIds) =>
      prevIds.includes(emp.id)
        ? prevIds.filter((existingId) => existingId !== emp.id)
        : [...prevIds, emp.id]
    );

    setSearch(emp.name);
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <div className={style.formFields}>
        <div className={style.field}>
          <label className={style.label}>Название проекта</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={style.input}
            placeholder="Введите название проекта"
            required
          />
        </div>

        <div className={`${style.field} ${style["has-dropdown"]}`}>
          <label className={style.label}>Назначить сотрудника</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Поиск по имени..."
            className={style.input}
          />
          {showDropdown && (
            <div className={style.dropdown}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleEmployeeIdToggle(emp)}
                    className={`${style.option} ${
                      employeeId?.includes(emp.id) ? style.selected : ""
                    }`}
                  >
                    {emp.name} — {emp.position}
                  </div>
                ))
              ) : (
                <div className={style.noMatch}>Нет совпадений</div>
              )}
            </div>
          )}
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

export default ProjectForm;
