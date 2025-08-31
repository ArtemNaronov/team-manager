/**
 * Функции для склонения русских слов
 */

/**
 * Склонение слова "сотрудник"
 * @param count - количество
 * @returns правильное склонение
 */
export const pluralizeEmployees = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} сотрудников`;
  }

  switch (lastDigit) {
    case 1:
      return `${count} сотрудник`;
    case 2:
    case 3:
    case 4:
      return `${count} сотрудника`;
    default:
      return `${count} сотрудников`;
  }
};

/**
 * Склонение слова "проект"
 * @param count - количество
 * @returns правильное склонение
 */
export const pluralizeProjects = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} проектов`;
  }

  switch (lastDigit) {
    case 1:
      return `${count} проект`;
    case 2:
    case 3:
    case 4:
      return `${count} проекта`;
    default:
      return `${count} проектов`;
  }
};

/**
 * Склонение слова "задача"
 * @param count - количество
 * @returns правильное склонение
 */
export const pluralizeTasks = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} задач`;
  }

  switch (lastDigit) {
    case 1:
      return `${count} задача`;
    case 2:
    case 3:
    case 4:
      return `${count} задачи`;
    default:
      return `${count} задач`;
  }
};
