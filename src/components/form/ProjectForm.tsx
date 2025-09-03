import { useState, useEffect, useRef } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase())
  );

  const positionDropdown = (inputElement: HTMLInputElement) => {
    const rect = inputElement.getBoundingClientRect();
    const dropdown = document.querySelector(
      `.${style.dropdown}`
    ) as HTMLElement;
    if (dropdown) {
      dropdown.style.top = `${rect.bottom + 5}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
    }
  };

  // Обработчик клика вне dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => {
              setShowDropdown(true);
              // Позиционируем dropdown после рендера
              setTimeout(() => positionDropdown(e.target), 0);
            }}
            placeholder="Поиск по имени..."
            className={style.input}
          />
          {showDropdown && (
            <div ref={dropdownRef} className={style.dropdown}>
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
