import type { Project, Employee, Task } from "../types/projectTypes";

// Конфигурация базы данных
const DB_NAME = "TeamManagerDB";
const DB_VERSION = 1;

// Названия таблиц (object stores)
const STORES = {
  PROJECTS: "projects",
  EMPLOYEES: "employees",
  TASKS: "tasks",
} as const;

// Интерфейс для операций с базой данных
export interface DBOperations {
  // Проекты
  getAllProjects(): Promise<Project[]>;
  addProject(project: Project): Promise<number>;
  updateProject(project: Project): Promise<void>;
  deleteProject(id: number): Promise<void>;

  // Сотрудники
  getAllEmployees(): Promise<Employee[]>;
  addEmployee(employee: Employee): Promise<number>;
  updateEmployee(employee: Employee): Promise<void>;
  deleteEmployee(id: number): Promise<void>;

  // Задачи
  getAllTasks(): Promise<Task[]>;
  addTask(task: Task): Promise<number>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: number): Promise<void>;

  // Очистка базы данных
  clearAllData(): Promise<void>;
}

class IndexedDBManager implements DBOperations {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Ошибка открытия IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB успешно инициализирована");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log("Обновление схемы IndexedDB...");

        // Создаем хранилище для проектов
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORES.PROJECTS, {
            keyPath: "id",
            autoIncrement: false,
          });
          projectStore.createIndex("title", "title", { unique: false });
        }

        // Создаем хранилище для сотрудников
        if (!db.objectStoreNames.contains(STORES.EMPLOYEES)) {
          const employeeStore = db.createObjectStore(STORES.EMPLOYEES, {
            keyPath: "id",
            autoIncrement: false,
          });
          employeeStore.createIndex("name", "name", { unique: false });
          employeeStore.createIndex("position", "position", { unique: false });
        }

        // Создаем хранилище для задач
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = db.createObjectStore(STORES.TASKS, {
            keyPath: "id",
            autoIncrement: false,
          });
          taskStore.createIndex("projectId", "projectId", { unique: false });
          taskStore.createIndex("status", "status", { unique: false });
          taskStore.createIndex("deadline", "deadline", { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  private async executeTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Методы для работы с проектами
  async getAllProjects(): Promise<Project[]> {
    return this.executeTransaction(STORES.PROJECTS, "readonly", (store) =>
      store.getAll()
    );
  }

  async addProject(project: Project): Promise<number> {
    await this.executeTransaction(STORES.PROJECTS, "readwrite", (store) =>
      store.add(project)
    );
    return project.id;
  }

  async updateProject(project: Project): Promise<void> {
    await this.executeTransaction(STORES.PROJECTS, "readwrite", (store) =>
      store.put(project)
    );
  }

  async deleteProject(id: number): Promise<void> {
    await this.executeTransaction(STORES.PROJECTS, "readwrite", (store) =>
      store.delete(id)
    );
  }

  // Методы для работы с сотрудниками
  async getAllEmployees(): Promise<Employee[]> {
    return this.executeTransaction(STORES.EMPLOYEES, "readonly", (store) =>
      store.getAll()
    );
  }

  async addEmployee(employee: Employee): Promise<number> {
    await this.executeTransaction(STORES.EMPLOYEES, "readwrite", (store) =>
      store.add(employee)
    );
    return employee.id;
  }

  async updateEmployee(employee: Employee): Promise<void> {
    await this.executeTransaction(STORES.EMPLOYEES, "readwrite", (store) =>
      store.put(employee)
    );
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.executeTransaction(STORES.EMPLOYEES, "readwrite", (store) =>
      store.delete(id)
    );
  }

  // Методы для работы с задачами
  async getAllTasks(): Promise<Task[]> {
    return this.executeTransaction(STORES.TASKS, "readonly", (store) =>
      store.getAll()
    );
  }

  async addTask(task: Task): Promise<number> {
    await this.executeTransaction(STORES.TASKS, "readwrite", (store) =>
      store.add(task)
    );
    return task.id;
  }

  async updateTask(task: Task): Promise<void> {
    await this.executeTransaction(STORES.TASKS, "readwrite", (store) =>
      store.put(task)
    );
  }

  async deleteTask(id: number): Promise<void> {
    await this.executeTransaction(STORES.TASKS, "readwrite", (store) =>
      store.delete(id)
    );
  }

  // Очистка всех данных
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames = [STORES.PROJECTS, STORES.EMPLOYEES, STORES.TASKS];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, "readwrite");

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });
    });
  }
}

// Экспортируем singleton инстанс
export const dbManager = new IndexedDBManager();
