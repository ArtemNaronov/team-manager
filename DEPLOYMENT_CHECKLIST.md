# 🔍 Checklist для проверки деплоя

## ✅ После деплоя проверьте:

### 1. **Откройте сайт в браузере:**
```
https://ВАШ_USERNAME.github.io/team-manager/
```

### 2. **Проверьте консоль разработчика (F12):**
- **Нет ошибок 404** для JS/CSS файлов
- **Нет ошибок CORS** 
- **Нет ошибок роутинга**

### 3. **Что должно отображаться:**
- ✅ Полностью загруженное приложение Team Manager
- ✅ Три кнопки управления (импорт, экспорт, поиск)
- ✅ Секции: Проекты, Сотрудники, Задачи
- ✅ Возможность создавать новые элементы

### 4. **Если видите пустую страницу (`<div id="root"></div>`):**

#### Проверьте консоль браузера:
```javascript
// Откройте DevTools (F12) → Console
// Должны увидеть ошибки загрузки ресурсов
```

#### Возможные проблемы:
1. **404 ошибки на JS/CSS файлы** → проблема с путями
2. **CORS ошибки** → проблема с базовым URL
3. **Router ошибки** → проблема с basename

#### Быстрое решение:
```bash
# Переключитесь на HashRouter
cp src/App-hash.tsx src/App.tsx
npm run build
npm run deploy:manual
```

### 5. **Альтернативные URL для тестирования:**
- С хэшем: `https://ВАШ_USERNAME.github.io/team-manager/#/`
- Прямой путь: `https://ВАШ_USERNAME.github.io/team-manager/index.html`

## 🛠️ Диагностика проблем:

### **GitHub Pages настройки:**
1. Settings → Pages → Source: 
   - **Deploy from branch** → **gh-pages** (для ручного деплоя)
   - **GitHub Actions** (для автоматического)

### **Проверка файлов:**
```bash
# Проверьте что файлы загружаются
curl -I https://ВАШ_USERNAME.github.io/team-manager/assets/index-*.js
curl -I https://ВАШ_USERNAME.github.io/team-manager/assets/index-*.css
```

### **Если ничего не помогает:**
1. Попробуйте другой workflow файл
2. Проверьте логи GitHub Actions
3. Используйте HashRouter вместо BrowserRouter
4. Измените base path в vite.config.ts

## 📞 Поддержка:
Если проблема не решается, приложите:
- URL вашего сайта
- Скриншот консоли браузера (ошибки)
- Содержимое настроек GitHub Pages
