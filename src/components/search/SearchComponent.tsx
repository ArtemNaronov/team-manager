import React, { useState, useMemo, useCallback } from "react";
import style from "./Search.module.scss";
import type {
  Project,
  Employee,
  Task,
  Subtask,
  Documentation,
} from "../../types/projectTypes";

// Типы для результатов поиска
export interface SearchResult {
  id: string;
  type: "project" | "employee" | "task" | "subtask" | "documentation";
  title: string;
  description?: string;
  matchedField: string;
  matchedText: string;
  data: Project | Employee | Task | Subtask | Documentation;
}

// Фильтры поиска
export interface SearchFilters {
  types: string[];
  statuses: string[];
}

interface Props {
  projects: Project[];
  employees: Employee[];
  tasks: Task[];
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}

const SearchComponent: React.FC<Props> = ({
  projects,
  employees,
  tasks,
  onResultClick,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    types: ["project", "employee", "task", "subtask", "documentation"],
    statuses: [],
  });
  const [isOpen] = useState(true); // Всегда открыт, так как управляется родителем

  // Поиск по проектам
  const searchProjects = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      projects.forEach((project) => {
        // Поиск по названию проекта
        if (project.title.toLowerCase().includes(query)) {
          results.push({
            id: `project-${project.id}`,
            type: "project",
            title: project.title,
            matchedField: "title",
            matchedText: project.title,
            data: project,
          });
        }

        // Поиск по документации проекта
        project.documentation.forEach((doc) => {
          if (
            doc.title.toLowerCase().includes(query) ||
            doc.url.toLowerCase().includes(query)
          ) {
            results.push({
              id: `documentation-${doc.id}`,
              type: "documentation",
              title: doc.title,
              description: `Проект: ${project.title}`,
              matchedField: doc.title.toLowerCase().includes(query)
                ? "title"
                : "url",
              matchedText: doc.title.toLowerCase().includes(query)
                ? doc.title
                : doc.url,
              data: doc,
            });
          }
        });
      });

      return results;
    },
    [projects]
  );

  // Поиск по сотрудникам
  const searchEmployees = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      employees.forEach((employee) => {
        if (
          employee.name.toLowerCase().includes(query) ||
          employee.position.toLowerCase().includes(query)
        ) {
          results.push({
            id: `employee-${employee.id}`,
            type: "employee",
            title: employee.name,
            description: employee.position,
            matchedField: employee.name.toLowerCase().includes(query)
              ? "name"
              : "position",
            matchedText: employee.name.toLowerCase().includes(query)
              ? employee.name
              : employee.position,
            data: employee,
          });
        }
      });

      return results;
    },
    [employees]
  );

  // Поиск по задачам и подзадачам
  const searchTasks = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      tasks.forEach((task) => {
        // Поиск по основной задаче
        if (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query)
        ) {
          let matchedField = "title";
          let matchedText = task.title;

          if (task.description.toLowerCase().includes(query)) {
            matchedField = "description";
            matchedText = task.description;
          } else if (task.status.toLowerCase().includes(query)) {
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

        // Поиск по подзадачам
        task.subtasks.forEach((subtask) => {
          if (
            subtask.title.toLowerCase().includes(query) ||
            subtask.description.toLowerCase().includes(query) ||
            subtask.status.toLowerCase().includes(query)
          ) {
            let matchedField = "title";
            let matchedText = subtask.title;

            if (subtask.description.toLowerCase().includes(query)) {
              matchedField = "description";
              matchedText = subtask.description;
            } else if (subtask.status.toLowerCase().includes(query)) {
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
        });
      });

      return results;
    },
    [tasks]
  );

  // Объединение всех результатов поиска
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const projectResults =
      filters.types.includes("project") ||
      filters.types.includes("documentation")
        ? searchProjects(query)
        : [];
    const employeeResults = filters.types.includes("employee")
      ? searchEmployees(query)
      : [];
    const taskResults =
      filters.types.includes("task") || filters.types.includes("subtask")
        ? searchTasks(query)
        : [];

    const allResults = [...projectResults, ...employeeResults, ...taskResults];

    // Фильтрация по типам
    const filteredByType = allResults.filter((result) =>
      filters.types.includes(result.type)
    );

    // Фильтрация по статусам (если применимо)
    const filteredByStatus =
      filters.statuses.length === 0
        ? filteredByType
        : filteredByType.filter((result) => {
            if (result.type === "task" || result.type === "subtask") {
              const taskData = result.data as Task | Subtask;
              return filters.statuses.includes(taskData.status);
            }
            return true;
          });

    // Сортировка по релевантности (точные совпадения в названии первыми)
    return filteredByStatus.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aTitleMatch = a.matchedField === "title";
      const bTitleMatch = b.matchedField === "title";
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return a.title.localeCompare(b.title);
    });
  }, [query, filters, searchProjects, searchEmployees, searchTasks]);

  // Подсветка совпадений в тексте
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className={style.highlight}>
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  // Иконки для типов
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return "📁";
      case "employee":
        return "👤";
      case "task":
        return "📋";
      case "subtask":
        return "📝";
      case "documentation":
        return "📄";
      default:
        return "🔍";
    }
  };

  // Названия типов на русском
  const getTypeName = (type: string) => {
    switch (type) {
      case "project":
        return "Проект";
      case "employee":
        return "Сотрудник";
      case "task":
        return "Задача";
      case "subtask":
        return "Подзадача";
      case "documentation":
        return "Документ";
      default:
        return "";
    }
  };

  const handleTypeFilterChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const handleClearSearch = () => {
    setQuery("");
    onClose(); // Закрываем через родительский обработчик
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    // onClose вызывается автоматически в родительском компоненте
  };

  return (
    <div className={style.searchContainer}>
      <div className={style.searchInput}>
        <div className={style.inputWrapper}>
          <span className={style.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Поиск проектов, сотрудников, задач..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={style.input}
            autoFocus
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className={style.clearButton}
              title="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>

        {/* Фильтры */}
        <div className={style.filters}>
          {["project", "employee", "task", "subtask", "documentation"].map(
            (type) => (
              <label key={type} className={style.filterLabel}>
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleTypeFilterChange(type)}
                  className={style.filterCheckbox}
                />
                <span className={style.filterText}>
                  {getTypeIcon(type)} {getTypeName(type)}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Результаты поиска */}
      {isOpen && query.trim() && (
        <div className={style.searchResults}>
          {searchResults.length > 0 ? (
            <>
              <div className={style.resultsHeader}>
                Найдено результатов: {searchResults.length}
              </div>
              <div className={style.resultsList}>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={style.resultItem}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className={style.resultIcon}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className={style.resultContent}>
                      <div className={style.resultTitle}>
                        {highlightMatch(result.title, query)}
                      </div>
                      {result.description && (
                        <div className={style.resultDescription}>
                          {highlightMatch(result.description, query)}
                        </div>
                      )}
                      <div className={style.resultMeta}>
                        {getTypeName(result.type)} • {result.matchedField}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={style.noResults}>
              <div className={style.noResultsIcon}>🔍</div>
              <div className={style.noResultsText}>
                Ничего не найдено по запросу "{query}"
              </div>
              <div className={style.noResultsHint}>
                Попробуйте изменить запрос или настройки фильтров
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
