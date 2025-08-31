/**
 * Валидация URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Пустой URL разрешен
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Валидация даты
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация обязательного поля
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Валидация минимальной длины
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};
