import type { Project, Employee, Task } from "../types/projectTypes";

/**
 * Генерирует уникальный ID
 */
export const generateId = (): number => {
  return Date.now() + Math.random();
};

/**
 * Фильтрует задачи по статусу
 */
export const filterTasksByStatus = (tasks: Task[], status: string): Task[] => {
  return tasks.filter((task) => task.status === status);
};

/**
 * Фильтрует задачи по сотруднику
 */
export const filterTasksByEmployee = (
  tasks: Task[],
  employeeId: number
): Task[] => {
  return tasks.filter((task) => task.employeeIds.includes(employeeId));
};

/**
 * Фильтрует задачи по проекту
 */
export const filterTasksByProject = (
  tasks: Task[],
  projectId: number
): Task[] => {
  return tasks.filter((task) => task.projectId === projectId);
};

/**
 * Получает сотрудника по ID
 */
export const getEmployeeById = (
  employees: Employee[],
  id: number
): Employee | undefined => {
  return employees.find((emp) => emp.id === id);
};

/**
 * Получает проект по ID
 */
export const getProjectById = (
  projects: Project[],
  id: number
): Project | undefined => {
  return projects.find((project) => project.id === id);
};

/**
 * Подсчитывает количество задач по статусам
 */
export const countTasksByStatus = (tasks: Task[]): Record<string, number> => {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Сортирует задачи по приоритету (дедлайну)
 */
export const sortTasksByDeadline = (tasks: Task[]): Task[] => {
  return [...tasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
};
