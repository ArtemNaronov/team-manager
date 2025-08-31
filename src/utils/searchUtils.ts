import type { Project, Employee, Task } from "../types/projectTypes";
import type { SearchResult } from "../components/search/SearchComponent";

/**
 * Нормализация строки для поиска (убираем лишние пробелы, приводим к нижнему регистру)
 */
export const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
};

/**
 * Проверка, содержит ли строка поисковый запрос
 */
export const containsQuery = (text: string, query: string): boolean => {
  return normalizeString(text).includes(normalizeString(query));
};

/**
 * Вычисление релевантности результата поиска
 */
export const calculateRelevance = (
  result: SearchResult,
  query: string
): number => {
  const normalizedQuery = normalizeString(query);
  const normalizedTitle = normalizeString(result.title);
  const normalizedDescription = normalizeString(result.description || "");

  let score = 0;

  // Точное совпадение названия - максимальный балл
  if (normalizedTitle === normalizedQuery) {
    score += 100;
  }
  // Название начинается с запроса
  else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 80;
  }
  // Название содержит запрос
  else if (normalizedTitle.includes(normalizedQuery)) {
    score += 60;
  }

  // Описание содержит запрос
  if (normalizedDescription.includes(normalizedQuery)) {
    score += 20;
  }

  // Бонус за совпадение в названии (более важное поле)
  if (result.matchedField === "title") {
    score += 30;
  }

  // Бонус за тип (проекты и задачи важнее)
  if (result.type === "project") {
    score += 15;
  } else if (result.type === "task") {
    score += 10;
  } else if (result.type === "employee") {
    score += 8;
  }

  return score;
};

/**
 * Поиск по всем сущностям с расчетом релевантности
 */
export const performGlobalSearch = (
  query: string,
  projects: Project[],
  employees: Employee[],
  tasks: Task[],
  filters: {
    types: string[];
    statuses: string[];
  }
): SearchResult[] => {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];
  // const normalizedQuery = normalizeString(query);

  // Поиск по проектам
  if (filters.types.includes("project")) {
    projects.forEach((project) => {
      if (containsQuery(project.title, query)) {
        results.push({
          id: `project-${project.id}`,
          type: "project",
          title: project.title,
          matchedField: "title",
          matchedText: project.title,
          data: project,
        });
      }
    });
  }

  // Поиск по документации
  if (filters.types.includes("documentation")) {
    projects.forEach((project) => {
      project.documentation.forEach((doc) => {
        if (containsQuery(doc.title, query) || containsQuery(doc.url, query)) {
          results.push({
            id: `documentation-${doc.id}`,
            type: "documentation",
            title: doc.title,
            description: `Проект: ${project.title}`,
            matchedField: containsQuery(doc.title, query) ? "title" : "url",
            matchedText: containsQuery(doc.title, query) ? doc.title : doc.url,
            data: doc,
          });
        }
      });
    });
  }

  // Поиск по сотрудникам
  if (filters.types.includes("employee")) {
    employees.forEach((employee) => {
      if (
        containsQuery(employee.name, query) ||
        containsQuery(employee.position, query)
      ) {
        results.push({
          id: `employee-${employee.id}`,
          type: "employee",
          title: employee.name,
          description: employee.position,
          matchedField: containsQuery(employee.name, query)
            ? "name"
            : "position",
          matchedText: containsQuery(employee.name, query)
            ? employee.name
            : employee.position,
          data: employee,
        });
      }
    });
  }

  // Поиск по задачам
  if (filters.types.includes("task")) {
    tasks.forEach((task) => {
      if (
        containsQuery(task.title, query) ||
        containsQuery(task.description, query) ||
        containsQuery(task.status, query)
      ) {
        // Проверяем фильтр по статусам
        if (
          filters.statuses.length === 0 ||
          filters.statuses.includes(task.status)
        ) {
          let matchedField = "title";
          let matchedText = task.title;

          if (containsQuery(task.description, query)) {
            matchedField = "description";
            matchedText = task.description;
          } else if (containsQuery(task.status, query)) {
            matchedField = "status";
            matchedText = task.status;
          }

          results.push({
            id: `task-${task.id}`,
            type: "task",
            title: task.title,
            description: task.description,
            matchedField,
            matchedText,
            data: task,
          });
        }
      }
    });
  }

  // Поиск по подзадачам
  if (filters.types.includes("subtask")) {
    tasks.forEach((task) => {
      task.subtasks.forEach((subtask) => {
        if (
          containsQuery(subtask.title, query) ||
          containsQuery(subtask.description, query) ||
          containsQuery(subtask.status, query)
        ) {
          // Проверяем фильтр по статусам
          if (
            filters.statuses.length === 0 ||
            filters.statuses.includes(subtask.status)
          ) {
            let matchedField = "title";
            let matchedText = subtask.title;

            if (containsQuery(subtask.description, query)) {
              matchedField = "description";
              matchedText = subtask.description;
            } else if (containsQuery(subtask.status, query)) {
              matchedField = "status";
              matchedText = subtask.status;
            }

            results.push({
              id: `subtask-${subtask.id}`,
              type: "subtask",
              title: subtask.title,
              description: `Задача: ${task.title}`,
              matchedField,
              matchedText,
              data: subtask,
            });
          }
        }
      });
    });
  }

  // Сортировка по релевантности
  return results.sort((a, b) => {
    const scoreA = calculateRelevance(a, query);
    const scoreB = calculateRelevance(b, query);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Сортировка по убыванию релевантности
    }

    // При одинаковой релевантности сортируем по алфавиту
    return a.title.localeCompare(b.title);
  });
};

/**
 * Получение статистики по результатам поиска
 */
export const getSearchStats = (results: SearchResult[]) => {
  const stats = {
    total: results.length,
    byType: {
      project: 0,
      employee: 0,
      task: 0,
      subtask: 0,
      documentation: 0,
    },
  };

  results.forEach((result) => {
    stats.byType[result.type]++;
  });

  return stats;
};

/**
 * Создание предложений для автодополнения
 */
export const generateSearchSuggestions = (
  projects: Project[],
  employees: Employee[],
  tasks: Task[]
): string[] => {
  const suggestions = new Set<string>();

  // Добавляем названия проектов
  projects.forEach((project) => {
    suggestions.add(project.title);
    // Добавляем слова из названий
    project.title.split(/\s+/).forEach((word) => {
      if (word.length > 2) {
        suggestions.add(word);
      }
    });
  });

  // Добавляем имена сотрудников и должности
  employees.forEach((employee) => {
    suggestions.add(employee.name);
    suggestions.add(employee.position);
    // Добавляем слова из имен и должностей
    employee.name.split(/\s+/).forEach((word) => {
      if (word.length > 2) {
        suggestions.add(word);
      }
    });
    employee.position.split(/\s+/).forEach((word) => {
      if (word.length > 2) {
        suggestions.add(word);
      }
    });
  });

  // Добавляем названия задач
  tasks.forEach((task) => {
    suggestions.add(task.title);
    // Добавляем слова из названий задач
    task.title.split(/\s+/).forEach((word) => {
      if (word.length > 2) {
        suggestions.add(word);
      }
    });

    // Добавляем названия подзадач
    task.subtasks.forEach((subtask) => {
      suggestions.add(subtask.title);
      subtask.title.split(/\s+/).forEach((word) => {
        if (word.length > 2) {
          suggestions.add(word);
        }
      });
    });
  });

  // Конвертируем в массив и сортируем
  return Array.from(suggestions)
    .filter((suggestion) => suggestion.length > 1)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Форматирование результатов поиска для экспорта
 */
export const formatSearchResultsForExport = (
  results: SearchResult[]
): string => {
  const stats = getSearchStats(results);

  let output = `Результаты поиска (${stats.total} найдено):\n\n`;

  // Группируем по типам
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Форматируем каждую группу
  Object.entries(grouped).forEach(([type, typeResults]) => {
    const typeName =
      {
        project: "Проекты",
        employee: "Сотрудники",
        task: "Задачи",
        subtask: "Подзадачи",
        documentation: "Документация",
      }[type] || type;

    output += `${typeName} (${typeResults.length}):\n`;
    typeResults.forEach((result, index) => {
      output += `${index + 1}. ${result.title}`;
      if (result.description) {
        output += ` - ${result.description}`;
      }
      output += "\n";
    });
    output += "\n";
  });

  return output;
};
