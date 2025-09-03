import { useState } from "react";
import DataModal from "../modal/Modal";
import EmployeeForm from "../form/EmployeeForm";
import Icon from "../Icon";
import style from "../TeamWorks.module.scss";
import { pluralizeProjects, pluralizeTasks } from "../../utils/textUtils";

import type { Employee, Project, Task } from "../../types/projectTypes";

interface Props {
  employees: Employee[];
  tasks: Task[]; // Добавляем список задач для подсчета
  projects: Project[];
  selectedProject: Project | null;
  selectedEmployee: Employee | null;
  onSelect: (employees: Employee) => void;
  onAdd: (data: {
    name: string;
    position: string;
    projectsId: number[];
  }) => void;
  onEdit: (
    employee: Employee,
    data: { name: string; position: string; projectsId: number[] }
  ) => void;
  onDelete: (employeeId: number) => void;
  onReassignTask?: (taskId: number, newEmployeeId: number) => void;
}

const EmployeeList = ({
  employees,
  tasks,
  projects,
  selectedProject,
  selectedEmployee,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  onReassignTask,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [dragOverEmployee, setDragOverEmployee] = useState<number | null>(null);

  const handleOpenAdd = () => {
    setEditEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setModalOpen(true);
  };

  const handleSubmit = (formData: {
    name: string;
    position: string;
    projectsId: number[];
  }) => {
    if (editEmployee) {
      onEdit(editEmployee, formData);
    } else {
      onAdd({
        ...formData,
        projectsId:
          selectedProject && selectedProject.id ? [selectedProject.id] : [],
      });
    }
    setModalOpen(false);
  };

  // Функция для подсчета задач сотрудника
  const getEmployeeTaskCount = (employeeId: number) => {
    return tasks.filter((task) => task.employeeIds.includes(employeeId)).length;
  };

  return (
    <div className={style.projects__column}>
      <div className={style.projects__column__header}>
        <h3>Сотрудники</h3>
      </div>

      <div className={style["projects__column__items-container"]}>
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => onSelect(emp)}
            onDoubleClick={() => handleOpenEdit(emp)}
            className={`${style.projects__column__item} ${
              selectedEmployee?.id === emp.id
                ? style["projects__column__item--selected"]
                : ""
            } ${dragOverEmployee === emp.id ? style["drop-zone-active"] : ""}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", emp.id.toString());
              e.dataTransfer.effectAllowed = "copy";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              // Проверяем тип данных для выбора правильного курсора
              if (e.dataTransfer.types.includes("application/json")) {
                e.dataTransfer.dropEffect = "copy"; // Плюс для добавления задачи к сотруднику
              } else {
                e.dataTransfer.dropEffect = "copy"; // Плюс для переноса сотрудника на проект
              }
              setDragOverEmployee(emp.id);
            }}
            onDragLeave={(e) => {
              // Проверяем, что мы действительно покинули элемент, а не его дочерний элемент
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverEmployee(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverEmployee(null);

              try {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                  const dropData = JSON.parse(data);
                  if (dropData.type === "task" && onReassignTask) {
                    onReassignTask(dropData.taskId, emp.id);
                  }
                }
              } catch (error) {
                console.error("Error parsing drop data:", error);
              }
            }}
          >
            <div className={`${style.projects__column__item__name}`}>
              <span
                className={`${style["projects__column__item__name--name"]}`}
              >
                {emp.name}
              </span>
              <span
                className={`${style["projects__column__item__name--position"]}`}
              >
                {emp.position}
              </span>
              <div className={style.employee_projects}>
                {emp.projectsId.length > 0 ? (
                  <div className={style.employee_stats}>
                    <span className={style.projects_count}>
                      {pluralizeProjects(emp.projectsId.length)}
                    </span>
                    <span className={style.tasks_count}>
                      {pluralizeTasks(getEmployeeTaskCount(emp.id))}
                    </span>
                  </div>
                ) : (
                  <span className={style.no_projects}>Нет проектов</span>
                )}
              </div>
            </div>
            <div className={`${style.projects__column__item__controll}`}>
              <button onClick={() => handleOpenEdit(emp)}>
                <Icon name="edit" size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(emp.id);
                }}
                title="Удалить сотрудника"
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
        Добавить сотрудника
      </button>

      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editEmployee ? "Редактирование сотрудника" : "Создание сотрудника"
        }
        data={editEmployee}
      >
        {() => (
          <EmployeeForm
            onSubmit={handleSubmit}
            projects={projects.map((p) => ({ id: p.id, title: p.title }))}
            initialName={editEmployee?.name}
            initialPosition={editEmployee?.position}
            initialProjectsId={editEmployee?.projectsId}
          />
        )}
      </DataModal>
    </div>
  );
};

export default EmployeeList;
