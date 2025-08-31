import { useState } from "react";
import DataModal from "../modal/Modal";
import ProjectForm from "../form/ProjectForm";
import style from "../TeamWorks.module.scss";
import { pluralizeEmployees, pluralizeTasks } from "../../utils/textUtils";

import type { Project, Employee, Task } from "../../types/projectTypes";

interface Props {
  projects: Project[];
  employees: Employee[];
  tasks: Task[]; // Добавляем список задач для подсчета
  selectedProject: Project | null;
  onSelect: (project: Project) => void;
  onAdd: (data: { title: string; employeeId: number[] }) => void;
  onEdit: (
    project: Project,
    data: { title: string; employeeId: number[] }
  ) => void;
  onDelete: (projectId: number) => void;
  onAssignEmployee: (employeeId: number, projectId: number) => void;
}

const ProjectList = ({
  projects,
  tasks,
  selectedProject,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  employees,
  onAssignEmployee,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const handleOpenAdd = () => {
    setEditProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditProject(project);
    setModalOpen(true);
  };

  const handleSubmit = (formData: { title: string; employeeId: number[] }) => {
    if (editProject) {
      onEdit(editProject, formData);
    } else {
      onAdd(formData);
    }
    setModalOpen(false);
  };

  const removeProjectItem = (project: Project) => {
    onDelete(project.id);
  };

  // Функция для подсчета задач проекта
  const getProjectTaskCount = (projectId: number) => {
    return tasks.filter((task) => {
      // Проверяем, что хотя бы один из сотрудников задачи работает в данном проекте
      return task.employeeIds.some((employeeId) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        return employee && employee.projectsId.includes(projectId);
      });
    }).length;
  };

  return (
    <div className={style.projects__column}>
      <div className={style.projects__column__header}>
        <h3>Проекты</h3>
      </div>

      <div className={style["projects__column__items-container"]}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelect(project)}
            className={`${style.projects__column__item} ${
              selectedProject?.id === project.id
                ? style["projects__column__item--selected"]
                : ""
            }`}
            onDoubleClick={() => handleOpenEdit(project)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy"; // Плюс для назначения сотрудника на проект
              e.currentTarget.classList.add(
                style["projects__column__item--drag-over"]
              );
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove(
                style["projects__column__item--drag-over"]
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove(
                style["projects__column__item--drag-over"]
              );
              const employeeId = parseInt(e.dataTransfer.getData("text/plain"));
              if (!isNaN(employeeId)) {
                onAssignEmployee(employeeId, project.id);
              }
            }}
          >
            <div className={style.project_info}>
              <span className={style.project_title}>{project.title}</span>
              <div className={style.employee_stats}>
                <span className={style.projects_count}>
                  {pluralizeEmployees(
                    employees.filter((emp) =>
                      emp.projectsId.includes(project.id)
                    ).length
                  )}
                </span>
                <span className={style.tasks_count}>
                  {pluralizeTasks(getProjectTaskCount(project.id))}
                </span>
              </div>
            </div>

            <div className={`${style.projects__column__item__controll}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  handleOpenEdit(project); // Передаем project в функцию
                }}
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
                  className="feather feather-edit"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  removeProjectItem(project); // Передаем project в функцию
                }}
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
                  className="feather feather-trash"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
        + Добавить проект
      </button>

      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProject ? "Редактирование проекта" : "Создание проекта"}
        data={editProject}
      >
        {() => (
          <ProjectForm
            onSubmit={handleSubmit}
            employees={employees}
            initialData={
              editProject
                ? {
                    title: editProject.title,
                    employeeId: employees
                      .filter((emp) => emp.projectsId.includes(editProject.id))
                      .map((emp) => emp.id),
                  }
                : null
            }
          />
        )}
      </DataModal>
    </div>
  );
};

export default ProjectList;
