import { useState, useMemo, useCallback, useEffect } from "react";
import style from "./TeamWorks.module.scss";
import ProjectList from "./list/ProjectList";
import EmployeeList from "./list/EmployeeList";
import DocumentationList from "./list/DocumentationList";
import TaskList from "./list/TaskList";
import SubTaskList from "./list/SubTaskList";
import ExpandableBlock from "./ExpandableBlock";
import SearchComponent from "./search/SearchComponent";
import type { SearchResult } from "./search/SearchComponent";
import { useIndexedDB } from "../hooks/useIndexedDB";
import Icon from "./Icon";

import type { Project, Employee, Task, Subtask } from "../types/projectTypes";
import { generateId, sortTasksByDeadline } from "../utils/dataUtils";

const ProjectViewer = () => {
  // Получаем данные и функции из IndexedDB хука
  const {
    projects,
    employees,
    tasks,
    loading,
    error,
    addProject: dbAddProject,
    updateProject: dbUpdateProject,
    deleteProject: dbDeleteProject,
    addEmployee: dbAddEmployee,
    updateEmployee: dbUpdateEmployee,

    addTask: dbAddTask,
    updateTask: dbUpdateTask,
    deleteTask: dbDeleteTask,
    exportDataToJSON,
    importDataFromJSON,
  } = useIndexedDB();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  // Состояние для управления расширенным блоком (только один)
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Состояние для поиска
  const [searchOpen, setSearchOpen] = useState(false);

  // Обработчик нажатия ESC для закрытия поиска
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  // Функция для переключения расширенного состояния блока
  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlock((prev) => {
      // Если клик по уже расширенному блоку - сворачиваем
      if (prev === blockId) {
        return null;
      }
      // Иначе расширяем новый блок (предыдущий автоматически свернется)
      return blockId;
    });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setSelectedEmployee(null);
    setSelectedTask(null);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const filteredEmployees = useMemo(
    () =>
      selectedProject
        ? employees.filter((emp) => emp.projectsId.includes(selectedProject.id))
        : [],
    [selectedProject, employees]
  );

  const filteredTasks = useMemo(() => {
    if (!selectedEmployee) return [];

    // Если выбран и сотрудник, и проект - показываем задачи для конкретного проекта
    if (selectedEmployee && selectedProject) {
      return sortTasksByDeadline(
        tasks.filter(
          (task) =>
            task.employeeIds.includes(selectedEmployee.id) &&
            task.projectId === selectedProject.id
        )
      );
    }

    // Если выбран только сотрудник - показываем все его задачи
    if (selectedEmployee) {
      return sortTasksByDeadline(
        tasks.filter((task) => task.employeeIds.includes(selectedEmployee.id))
      );
    }

    return [];
  }, [tasks, selectedEmployee, selectedProject]);

  const addProject = async (formData: {
    title: string;
    employeeId: number[];
  }) => {
    try {
      const newProjectId = generateId();
      const newProject = {
        id: newProjectId,
        title: formData.title,
        documentation: [],
      };

      // Добавляем новый проект в IndexedDB
      await dbAddProject(newProject);

      // Обновляем сотрудников - добавляем им ID нового проекта
      const employeesToUpdate = employees.filter((employee) =>
        formData.employeeId.includes(employee.id)
      );

      for (const employee of employeesToUpdate) {
        const updatedEmployee = {
          ...employee,
          projectsId: [...employee.projectsId, newProjectId],
        };
        await dbUpdateEmployee(updatedEmployee);
      }

      setNotification({
        message: "Проект успешно создан",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка создания проекта:", error);
      setNotification({
        message: "Ошибка при создании проекта",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const editProject = async (
    project: Project,
    formData: { title: string; employeeId: number[] }
  ) => {
    try {
      // Обновляем проект в IndexedDB
      const updatedProject = { ...project, title: formData.title };
      await dbUpdateProject(updatedProject);

      // Получаем текущих сотрудников проекта
      const currentEmployeeIds = employees
        .filter((emp) => emp.projectsId.includes(project.id))
        .map((emp) => emp.id);

      // Находим сотрудников для добавления и удаления
      const employeesToAdd = formData.employeeId.filter(
        (id) => !currentEmployeeIds.includes(id)
      );
      const employeesToRemove = currentEmployeeIds.filter(
        (id) => !formData.employeeId.includes(id)
      );

      // Обновляем назначения сотрудников
      for (const employeeId of employeesToAdd) {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
          const updatedEmployee = {
            ...employee,
            projectsId: [...employee.projectsId, project.id],
          };
          await dbUpdateEmployee(updatedEmployee);
        }
      }

      for (const employeeId of employeesToRemove) {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
          const updatedEmployee = {
            ...employee,
            projectsId: employee.projectsId.filter((id) => id !== project.id),
          };
          await dbUpdateEmployee(updatedEmployee);
        }
      }

      // Обновляем selectedProject, если он редактируется
      if (selectedProject?.id === project.id) {
        setSelectedProject(updatedProject);
      }

      setNotification({
        message: "Проект успешно обновлен",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка обновления проекта:", error);
      setNotification({
        message: "Ошибка при обновлении проекта",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Функция для удаления проекта
  const deleteProject = async (projectId: number) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить этот проект? Это также удалит все связанные задачи."
      )
    ) {
      try {
        // Удаляем проект из IndexedDB
        await dbDeleteProject(projectId);

        // Обновляем сотрудников - удаляем проект из их списка
        const employeesToUpdate = employees.filter((emp) =>
          emp.projectsId.includes(projectId)
        );

        for (const employee of employeesToUpdate) {
          const updatedEmployee = {
            ...employee,
            projectsId: employee.projectsId.filter(
              (id: number) => id !== projectId
            ),
          };
          await dbUpdateEmployee(updatedEmployee);
        }

        // Удаляем связанные задачи
        const tasksToDelete = tasks.filter(
          (task) => task.projectId === projectId
        );
        for (const task of tasksToDelete) {
          await dbDeleteTask(task.id);
        }

        // Сбрасываем выбранный проект, если он был удален
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setSelectedEmployee(null);
          setSelectedTask(null);
        }

        setNotification({
          message: "Проект успешно удален",
          type: "success",
        });

        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error("Ошибка удаления проекта:", error);
        setNotification({
          message: "Ошибка при удалении проекта",
          type: "info",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const addEmployee = async (formData: {
    name: string;
    position: string;
    projectsId: number[];
  }) => {
    try {
      const newEmployee = {
        id: generateId(),
        ...formData,
      };

      await dbAddEmployee(newEmployee);

      setNotification({
        message: "Сотрудник успешно добавлен",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка добавления сотрудника:", error);
      setNotification({
        message: "Ошибка при добавлении сотрудника",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const editEmployee = async (
    employee: Employee,
    formData: {
      name: string;
      position: string;
      projectsId: number[];
    }
  ) => {
    try {
      const updatedEmployee = { ...employee, ...formData };
      await dbUpdateEmployee(updatedEmployee);

      // Обновляем selectedEmployee, если он редактируется
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(updatedEmployee);
      }

      setNotification({
        message: "Сотрудник успешно обновлен",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка обновления сотрудника:", error);
      setNotification({
        message: "Ошибка при обновлении сотрудника",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Функция для выхода текущего сотрудника из задачи
  const removeCurrentEmployeeFromTask = async (taskId: number) => {
    if (!selectedEmployee) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Проверяем, участвует ли текущий сотрудник в задаче
    if (!task.employeeIds.includes(selectedEmployee.id)) {
      setNotification({
        message: "Вы не участвуете в этой задаче",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (
      window.confirm(
        task.employeeIds.length === 1
          ? "Вы единственный исполнитель этой задачи. При выходе задача будет удалена. Продолжить?"
          : `Вы уверены, что хотите выйти из задачи "${task.title}"?`
      )
    ) {
      try {
        if (task.employeeIds.length === 1) {
          // Если единственный исполнитель - удаляем задачу
          await dbDeleteTask(taskId);
        } else {
          // Иначе просто убираем текущего сотрудника
          const updatedTask = {
            ...task,
            employeeIds: task.employeeIds.filter(
              (id) => id !== selectedEmployee.id
            ),
          };
          await dbUpdateTask(updatedTask);
        }

        // Сбрасываем выбранную задачу, если она была удалена или текущий сотрудник вышел из неё
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }

        const wasDeleted = task.employeeIds.length === 1;
        setNotification({
          message: wasDeleted
            ? "Задача удалена (не осталось исполнителей)"
            : `Вы вышли из задачи "${task.title}"`,
          type: "success",
        });

        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error("Ошибка при выходе из задачи:", error);
        setNotification({
          message: "Ошибка при выходе из задачи",
          type: "info",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Функция для удаления сотрудника из проекта (не полностью)
  const removeEmployeeFromProject = async (employeeId: number) => {
    if (!selectedProject) return;

    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (
      window.confirm(
        `Вы уверены, что хотите удалить ${employee.name} из проекта "${selectedProject.title}"? Это также удалит все его задачи в этом проекте.`
      )
    ) {
      try {
        // Удаляем проект из списка проектов сотрудника
        const updatedEmployee = {
          ...employee,
          projectsId: employee.projectsId.filter(
            (id) => id !== selectedProject.id
          ),
        };
        await dbUpdateEmployee(updatedEmployee);

        // Удаляем связанные задачи только этого проекта или убираем сотрудника из задач
        const tasksToUpdate = tasks.filter(
          (task) =>
            task.projectId === selectedProject.id &&
            task.employeeIds.includes(employeeId)
        );

        for (const task of tasksToUpdate) {
          if (task.employeeIds.length === 1) {
            // Если сотрудник единственный - удаляем задачу
            await dbDeleteTask(task.id);
          } else {
            // Иначе просто убираем сотрудника из списка исполнителей
            const updatedTask = {
              ...task,
              employeeIds: task.employeeIds.filter((id) => id !== employeeId),
            };
            await dbUpdateTask(updatedTask);
          }
        }

        // Сбрасываем выбранного сотрудника, если он был удален из текущего проекта
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(null);
          setSelectedTask(null);
        }

        setNotification({
          message: `${employee.name} успешно удален из проекта "${selectedProject.title}"`,
          type: "success",
        });

        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error("Ошибка удаления сотрудника из проекта:", error);
        setNotification({
          message: "Ошибка при удалении сотрудника из проекта",
          type: "info",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Функция для назначения сотрудника на проект через drag & drop
  const assignEmployeeToProject = async (
    employeeId: number,
    projectId: number
  ) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    const project = projects.find((proj) => proj.id === projectId);

    if (!employee || !project) return;

    // Проверяем, не назначен ли уже сотрудник на проект
    if (employee.projectsId.includes(projectId)) {
      setNotification({
        message: `${employee.name} уже назначен на проект "${project.title}"`,
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const updatedEmployee = {
        ...employee,
        projectsId: [...employee.projectsId, projectId],
      };
      await dbUpdateEmployee(updatedEmployee);

      setNotification({
        message: `${employee.name} успешно назначен на проект "${project.title}"`,
        type: "success",
      });

      // Автоматически скрываем уведомление через 3 секунды
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка назначения сотрудника на проект:", error);
      setNotification({
        message: "Ошибка при назначении сотрудника",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Функция для добавления сотрудника к задаче
  const addEmployeeToTask = async (taskId: number, newEmployeeId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    const newEmployee = employees.find((emp) => emp.id === newEmployeeId);

    if (!task || !newEmployee) return;

    // Проверяем, что новый сотрудник назначен на этот проект
    if (!newEmployee.projectsId.includes(task.projectId)) {
      setNotification({
        message: `${newEmployee.name} не назначен на этот проект`,
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Проверяем, что сотрудник еще не назначен на эту задачу
    if (task.employeeIds.includes(newEmployeeId)) {
      setNotification({
        message: `${newEmployee.name} уже назначен на эту задачу`,
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // Добавляем сотрудника к задаче (подзадачи остаются как есть)
      const updatedTask = {
        ...task,
        employeeIds: [...task.employeeIds, newEmployeeId],
      };
      await dbUpdateTask(updatedTask);

      setNotification({
        message: `${newEmployee.name} добавлен к задаче "${task.title}"`,
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка добавления сотрудника к задаче:", error);
      setNotification({
        message: "Ошибка при добавлении сотрудника к задаче",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const addDocumentation = async (formData: { title: string; url: string }) => {
    if (!selectedProject) {
      throw new Error("selectedProject is null or undefined");
    }

    try {
      const updatedProject = {
        ...selectedProject,
        documentation: [
          ...selectedProject.documentation,
          { id: generateId(), ...formData },
        ],
      };

      await dbUpdateProject(updatedProject);
      setSelectedProject(updatedProject);

      setNotification({
        message: "Документация успешно добавлена",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка добавления документации:", error);
      setNotification({
        message: "Ошибка при добавлении документации",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const editDocumentation = async (
    documentationId: number,
    formData: { title: string; url: string }
  ) => {
    if (!selectedProject) return;

    try {
      const updatedProject = {
        ...selectedProject,
        documentation: selectedProject.documentation.map((doc) =>
          doc.id === documentationId ? { ...doc, ...formData } : doc
        ),
      };

      await dbUpdateProject(updatedProject);
      setSelectedProject(updatedProject);

      setNotification({
        message: "Документация успешно обновлена",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка обновления документации:", error);
      setNotification({
        message: "Ошибка при обновлении документации",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Функция для удаления документации
  const deleteDocumentation = async (documentationId: number) => {
    if (!selectedProject) return;

    if (window.confirm("Вы уверены, что хотите удалить эту документацию?")) {
      try {
        const updatedProject = {
          ...selectedProject,
          documentation: selectedProject.documentation.filter(
            (doc) => doc.id !== documentationId
          ),
        };

        await dbUpdateProject(updatedProject);
        setSelectedProject(updatedProject);

        setNotification({
          message: "Документация успешно удалена",
          type: "success",
        });

        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error("Ошибка удаления документации:", error);
        setNotification({
          message: "Ошибка при удалении документации",
          type: "info",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const addTask = useCallback(
    async (
      formData: Omit<Task, "id" | "employeeIds" | "projectId" | "subtasks">
    ) => {
      if (selectedEmployee && selectedProject) {
        try {
          const newTask = {
            ...formData,
            id: generateId(),
            employeeIds: [selectedEmployee.id], // Создаем массив с одним сотрудником
            projectId: selectedProject.id,
            subtasks: [],
          };

          await dbAddTask(newTask);

          setNotification({
            message: "Задача успешно создана",
            type: "success",
          });

          setTimeout(() => setNotification(null), 3000);
        } catch (error) {
          console.error("Ошибка создания задачи:", error);
          setNotification({
            message: "Ошибка при создании задачи",
            type: "info",
          });
          setTimeout(() => setNotification(null), 3000);
        }
      }
    },
    [selectedEmployee, selectedProject, dbAddTask]
  );

  const editTask = async (
    task: Task,
    formData: Omit<Task, "id" | "employeeIds" | "projectId" | "subtasks">
  ) => {
    try {
      // Обновляем задачу
      const updatedTask = { ...task, ...formData };
      await dbUpdateTask(updatedTask);

      // Обновляем selectedTask, если он редактируется
      if (selectedTask?.id === task.id) {
        setSelectedTask(updatedTask);
      }

      setNotification({
        message: "Задача успешно обновлена",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
      setNotification({
        message: "Ошибка при обновлении задачи",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const addSubtask = async (formData: Omit<Subtask, "id">) => {
    if (!selectedTask) {
      throw new Error("Не выбрана задача для добавления подзадачи");
    }

    try {
      const newSubtask: Subtask = {
        id: generateId(),
        ...formData,
      };

      // Обновляем задачи
      const updatedTask = {
        ...selectedTask,
        subtasks: [...selectedTask.subtasks, newSubtask],
      };

      await dbUpdateTask(updatedTask);

      // Обновляем выбранную задачу
      setSelectedTask(updatedTask);

      setNotification({
        message: "Подзадача успешно создана",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка создания подзадачи:", error);
      setNotification({
        message: "Ошибка при создании подзадачи",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const editSubtask = async (
    subtaskId: number,
    updatedData: Partial<Subtask>
  ) => {
    if (!selectedTask) return;

    try {
      const updatedTask = {
        ...selectedTask,
        subtasks: selectedTask.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, ...updatedData } : subtask
        ),
      };

      await dbUpdateTask(updatedTask);
      setSelectedTask(updatedTask);

      setNotification({
        message: "Подзадача успешно обновлена",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка обновления подзадачи:", error);
      setNotification({
        message: "Ошибка при обновлении подзадачи",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const deleteSubtask = async (subtaskId: number) => {
    if (!selectedTask) return;

    try {
      const updatedTask = {
        ...selectedTask,
        subtasks: selectedTask.subtasks.filter(
          (subtask) => subtask.id !== subtaskId
        ),
      };

      await dbUpdateTask(updatedTask);
      setSelectedTask(updatedTask);

      setNotification({
        message: "Подзадача успешно удалена",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка удаления подзадачи:", error);
      setNotification({
        message: "Ошибка при удалении подзадачи",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const reorderSubtasks = async (subtaskIds: number[]) => {
    if (!selectedTask) return;

    try {
      const reorderedSubtasks = subtaskIds
        .map((id) => selectedTask.subtasks.find((subtask) => subtask.id === id))
        .filter(Boolean) as Subtask[];

      const updatedTask = {
        ...selectedTask,
        subtasks: reorderedSubtasks,
      };

      await dbUpdateTask(updatedTask);
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error("Ошибка пересортировки подзадач:", error);
      setNotification({
        message: "Ошибка при пересортировке подзадач",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Обработчик результатов поиска
  const handleSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case "project":
        setSelectedProject(result.data as Project);
        setExpandedBlock("projects");
        break;
      case "employee":
        setSelectedEmployee(result.data as Employee);
        setExpandedBlock("employees");
        break;
      case "task":
        const task = result.data as Task;
        setSelectedTask(task);
        // Также выберем проект для контекста
        const taskProject = projects.find((p) => p.id === task.projectId);
        if (taskProject) {
          setSelectedProject(taskProject);
        }
        setExpandedBlock("tasks");
        break;
      case "subtask":
        // Найдем родительскую задачу для подзадачи
        const subtask = result.data as Subtask;
        const parentTask = tasks.find((t) =>
          t.subtasks.some((s) => s.id === subtask.id)
        );
        if (parentTask) {
          setSelectedTask(parentTask);
          const parentProject = projects.find(
            (p) => p.id === parentTask.projectId
          );
          if (parentProject) {
            setSelectedProject(parentProject);
          }
          setExpandedBlock("subtasks");
        }
        break;
      case "documentation":
        // Найдем проект для документации
        const doc = result.data as any; // Documentation type
        const docProject = projects.find((p) =>
          p.documentation.some((d) => d.id === doc.id)
        );
        if (docProject) {
          setSelectedProject(docProject);
          setExpandedBlock("documentation");
        }
        break;
    }
    setSearchOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  const handleExportData = () => {
    try {
      exportDataToJSON();
      setNotification({
        message: "Данные успешно экспортированы",
        type: "success",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Ошибка экспорта:", error);
      setNotification({
        message: "Ошибка при экспорте данных",
        type: "info",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleImportData = () => {
    // Создаем скрытый input для выбора файла
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await importDataFromJSON(file);

        // Сбрасываем выбранные элементы после импорта
        setSelectedProject(null);
        setSelectedEmployee(null);
        setSelectedTask(null);

        setNotification({
          message: `Данные успешно импортированы из файла "${file.name}"`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error("Ошибка импорта:", error);
        setNotification({
          message:
            error instanceof Error
              ? error.message
              : "Ошибка при импорте данных",
          type: "info",
        });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    // Добавляем input в DOM, кликаем и удаляем
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // Показываем индикатор загрузки
  if (loading.initializing) {
    return (
      <div className={`${style.projects} fade-in`}>
        <div className={style.loadingContainer}>
          <div className={style.loadingSpinner}></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={`${style.projects} fade-in`}>
        <div className={style.errorContainer}>
          <h3>Ошибка загрузки данных</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.projects} fade-in`}>
      {/* Уведомления */}
      {notification && (
        <div
          className={`${style.notification} ${
            style[`notification--${notification.type}`]
          }`}
        >
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className={style.notification__close}
          >
            ×
          </button>
        </div>
      )}

      {/* Кнопки управления */}
      <div className={style.actionButtons}>
        <button
          onClick={handleImportData}
          className={style.actionButton}
          title="Импорт данных из JSON"
        >
          <Icon name="import" size={24} />
        </button>

        <button
          onClick={handleExportData}
          className={style.actionButton}
          title="Экспорт данных в JSON"
        >
          <Icon name="export" size={24} />
        </button>

        <button
          onClick={handleSearchToggle}
          className={style.actionButton}
          title="Открыть поиск"
        >
          <Icon name="search" size={24} />
        </button>
      </div>

      {/* Компонент поиска */}
      {searchOpen && (
        <div
          className={style.searchOverlay}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={style.searchModal}
            onClick={(e) => e.stopPropagation()}
          >
            <SearchComponent
              projects={projects}
              employees={employees}
              tasks={tasks}
              onResultClick={handleSearchResult}
              onClose={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}

      <ExpandableBlock
        id="projects"
        isExpanded={expandedBlock === "projects"}
        onToggle={toggleBlockExpansion}
      >
        <ProjectList
          projects={projects}
          employees={employees}
          tasks={tasks}
          selectedProject={selectedProject}
          onSelect={handleProjectClick}
          onAdd={addProject}
          onEdit={editProject}
          onDelete={deleteProject}
          onAssignEmployee={assignEmployeeToProject}
        />
      </ExpandableBlock>

      <ExpandableBlock
        id="employees"
        isExpanded={expandedBlock === "employees"}
        onToggle={toggleBlockExpansion}
      >
        <EmployeeList
          employees={filteredEmployees}
          tasks={tasks}
          projects={projects}
          selectedProject={selectedProject}
          selectedEmployee={selectedEmployee}
          onSelect={handleEmployeeClick}
          onEdit={editEmployee}
          onDelete={removeEmployeeFromProject}
          onAdd={addEmployee}
          onReassignTask={addEmployeeToTask}
        />
      </ExpandableBlock>

      {selectedProject && (
        <ExpandableBlock
          id="documentation"
          isExpanded={expandedBlock === "documentation"}
          onToggle={toggleBlockExpansion}
        >
          <DocumentationList
            selectedProject={selectedProject}
            onAdd={addDocumentation}
            onEdit={editDocumentation}
            onDelete={deleteDocumentation}
          />
        </ExpandableBlock>
      )}

      {selectedEmployee && (
        <ExpandableBlock
          id="tasks"
          isExpanded={expandedBlock === "tasks"}
          onToggle={toggleBlockExpansion}
        >
          <TaskList
            tasks={filteredTasks}
            employees={employees}
            selectedEmployee={selectedEmployee}
            selectedTask={selectedTask}
            onSelect={handleTaskClick}
            onAdd={addTask}
            onEdit={editTask}
            onDelete={removeCurrentEmployeeFromTask}
          />
        </ExpandableBlock>
      )}

      {selectedTask && (
        <ExpandableBlock
          id="subtasks"
          isExpanded={expandedBlock === "subtasks"}
          onToggle={toggleBlockExpansion}
          className={style["subtasks-container"]}
        >
          <SubTaskList
            selectedTask={selectedTask}
            onAdd={addSubtask}
            onEdit={editSubtask}
            onDelete={deleteSubtask}
            onReorder={reorderSubtasks}
          />
        </ExpandableBlock>
      )}
    </div>
  );
};

export default ProjectViewer;
