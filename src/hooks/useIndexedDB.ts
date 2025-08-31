import { useState, useEffect, useCallback } from "react";
import { dbManager } from "../utils/indexedDB";
import type { Project, Employee, Task } from "../types/projectTypes";

// Типы для состояния загрузки
interface LoadingState {
  projects: boolean;
  employees: boolean;
  tasks: boolean;
  initializing: boolean;
}

// Хук для управления данными через IndexedDB
export const useIndexedDB = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    projects: true,
    employees: true,
    tasks: true,
    initializing: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки всех данных
  const loadAllData = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, initializing: true }));

      // Загружаем все данные параллельно
      const [projectsData, employeesData, tasksData] = await Promise.all([
        dbManager.getAllProjects(),
        dbManager.getAllEmployees(),
        dbManager.getAllTasks(),
      ]);

      setProjects(projectsData);
      setEmployees(employeesData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading({
        projects: false,
        employees: false,
        tasks: false,
        initializing: false,
      });
    }
  }, []);

  // Инициализация при монтировании компонента
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Функции для работы с проектами
  const addProject = useCallback(async (project: Project): Promise<void> => {
    try {
      await dbManager.addProject(project);
      setProjects((prev) => [...prev, project]);
    } catch (err) {
      console.error("Ошибка добавления проекта:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка добавления проекта"
      );
    }
  }, []);

  const updateProject = useCallback(async (project: Project): Promise<void> => {
    try {
      await dbManager.updateProject(project);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      );
    } catch (err) {
      console.error("Ошибка обновления проекта:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка обновления проекта"
      );
    }
  }, []);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    try {
      await dbManager.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Ошибка удаления проекта:", err);
      setError(err instanceof Error ? err.message : "Ошибка удаления проекта");
    }
  }, []);

  // Функции для работы с сотрудниками
  const addEmployee = useCallback(async (employee: Employee): Promise<void> => {
    try {
      await dbManager.addEmployee(employee);
      setEmployees((prev) => [...prev, employee]);
    } catch (err) {
      console.error("Ошибка добавления сотрудника:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка добавления сотрудника"
      );
    }
  }, []);

  const updateEmployee = useCallback(
    async (employee: Employee): Promise<void> => {
      try {
        await dbManager.updateEmployee(employee);
        setEmployees((prev) =>
          prev.map((e) => (e.id === employee.id ? employee : e))
        );
      } catch (err) {
        console.error("Ошибка обновления сотрудника:", err);
        setError(
          err instanceof Error ? err.message : "Ошибка обновления сотрудника"
        );
      }
    },
    []
  );

  const deleteEmployee = useCallback(async (id: number): Promise<void> => {
    try {
      await dbManager.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Ошибка удаления сотрудника:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка удаления сотрудника"
      );
    }
  }, []);

  // Функции для работы с задачами
  const addTask = useCallback(async (task: Task): Promise<void> => {
    try {
      await dbManager.addTask(task);
      setTasks((prev) => [...prev, task]);
    } catch (err) {
      console.error("Ошибка добавления задачи:", err);
      setError(err instanceof Error ? err.message : "Ошибка добавления задачи");
    }
  }, []);

  const updateTask = useCallback(async (task: Task): Promise<void> => {
    try {
      await dbManager.updateTask(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } catch (err) {
      console.error("Ошибка обновления задачи:", err);
      setError(err instanceof Error ? err.message : "Ошибка обновления задачи");
    }
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    try {
      await dbManager.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Ошибка удаления задачи:", err);
      setError(err instanceof Error ? err.message : "Ошибка удаления задачи");
    }
  }, []);

  // Функция для очистки всех данных
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await dbManager.clearAllData();
      setProjects([]);
      setEmployees([]);
      setTasks([]);
      setError(null);
    } catch (err) {
      console.error("Ошибка очистки данных:", err);
      setError(err instanceof Error ? err.message : "Ошибка очистки данных");
    }
  }, []);

  // Функция для принудительной перезагрузки данных
  const refreshData = useCallback(async (): Promise<void> => {
    await loadAllData();
  }, [loadAllData]);

  // Функция для экспорта всех данных в JSON
  const exportDataToJSON = useCallback((): void => {
    try {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          projects,
          employees,
          tasks,
        },
        meta: {
          projectsCount: projects.length,
          employeesCount: employees.length,
          tasksCount: tasks.length,
          totalSubtasks: tasks.reduce(
            (total, task) => total + task.subtasks.length,
            0
          ),
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Создаем временную ссылку для скачивания
      const link = document.createElement("a");
      link.href = url;
      link.download = `team-manager-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Освобождаем URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при экспорте данных:", error);
      throw new Error("Не удалось экспортировать данные");
    }
  }, [projects, employees, tasks]);

  // Функция для импорта данных из JSON
  const importDataFromJSON = useCallback(
    async (file: File): Promise<void> => {
      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        // Валидация структуры файла
        if (!importData.data || !importData.version) {
          throw new Error("Неверный формат файла");
        }

        const {
          projects: importProjects,
          employees: importEmployees,
          tasks: importTasks,
        } = importData.data;

        if (
          !Array.isArray(importProjects) ||
          !Array.isArray(importEmployees) ||
          !Array.isArray(importTasks)
        ) {
          throw new Error("Неверная структура данных в файле");
        }

        // Очищаем текущие данные
        await dbManager.clearAllData();

        // Импортируем новые данные
        for (const project of importProjects) {
          await dbManager.addProject(project);
        }

        for (const employee of importEmployees) {
          await dbManager.addEmployee(employee);
        }

        for (const task of importTasks) {
          await dbManager.addTask(task);
        }

        // Перезагружаем данные в состояние
        await loadAllData();
      } catch (error) {
        console.error("Ошибка при импорте данных:", error);
        if (error instanceof SyntaxError) {
          throw new Error("Файл содержит некорректный JSON");
        }
        throw new Error(
          error instanceof Error
            ? error.message
            : "Не удалось импортировать данные"
        );
      }
    },
    [loadAllData]
  );

  return {
    // Данные
    projects,
    employees,
    tasks,

    // Состояние загрузки
    loading,
    error,

    // Функции для проектов
    addProject,
    updateProject,
    deleteProject,

    // Функции для сотрудников
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // Функции для задач
    addTask,
    updateTask,
    deleteTask,

    // Утилитарные функции
    clearAllData,
    refreshData,
    exportDataToJSON,
    importDataFromJSON,
  };
};
