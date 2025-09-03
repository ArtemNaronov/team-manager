import { useState } from "react";
import DataModal from "../modal/Modal";
import ProjectForm from "../form/ProjectForm";
import Icon from "../Icon";
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
                <Icon name="edit" size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  removeProjectItem(project); // Передаем project в функцию
                }}
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
        Добавить проект
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
