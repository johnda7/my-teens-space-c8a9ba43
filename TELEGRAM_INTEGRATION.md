# 📱 Telegram Web App Integration

## 🎯 Обзор

MyTeens.Space теперь полностью интегрирован с Telegram Web App API для нативного пользовательского опыта внутри Telegram.

## ✨ Возможности

### 1. **Telegram Web App SDK**
- Автоматическая загрузка SDK
- Готовность приложения (`ready()`)
- Развертывание на весь экран (`expand()`)
- Доступ к данным пользователя Telegram

### 2. **Haptic Feedback** 🎮

Тактильная обратная связь при взаимодействиях:

```tsx
import { useTelegram } from '@/hooks/useTelegram';

const { haptic } = useTelegram();

// Легкое нажатие
haptic.light();

// Среднее нажатие
haptic.medium();

// Сильное нажатие
haptic.heavy();

// Уведомления
haptic.success(); // ✅ Успех
haptic.error();   // ❌ Ошибка
haptic.warning(); // ⚠️ Предупреждение

// Выбор
haptic.selection(); // При переключении вкладок
```

### 3. **Theme Integration** 🎨

Автоматическое применение Telegram темы:

```tsx
const { themeParams, colorScheme } = useTelegram();

// Доступные параметры темы:
- bg_color
- text_color
- hint_color
- link_color
- button_color
- button_text_color
- secondary_bg_color
```

### 4. **User Data** 👤

Доступ к данным пользователя Telegram:

```tsx
const { user, isInTelegram } = useTelegram();

if (user) {
  console.log(user.first_name);
  console.log(user.username);
  console.log(user.language_code);
}
```

## 📦 Установка зависимостей

```bash
npm install @telegram-apps/telegram-ui @telegram-apps/sdk-react
```

## 🎨 Telegram-Style Design System

Обновленная цветовая схема в `index.css`:

```css
:root {
  /* Primary - Telegram blue */
  --primary: 213 89% 54%;
  
  /* Telegram-specific colors */
  --telegram-bg: 0 0% 100%;
  --telegram-text: 216 12% 8%;
  --telegram-button: 213 89% 54%;
  --telegram-link: 213 89% 54%;
}
```

## 🚀 Использование

### Базовый хук:

```tsx
import { useTelegram } from '@/hooks/useTelegram';

function MyComponent() {
  const { webApp, isInTelegram, user, haptic, themeParams } = useTelegram();
  
  const handleClick = () => {
    haptic.light(); // Тактильная обратная связь
    // Ваша логика
  };
  
  return (
    <button onClick={handleClick}>
      {user?.first_name ? `Привет, ${user.first_name}!` : 'Привет!'}
    </button>
  );
}
```

### MainButton:

```tsx
// Показать главную кнопку Telegram
useEffect(() => {
  if (webApp?.MainButton) {
    webApp.MainButton.setText('Продолжить');
    webApp.MainButton.show();
    webApp.MainButton.onClick(() => {
      // Действие
    });
  }
  
  return () => {
    webApp?.MainButton.hide();
  };
}, [webApp]);
```

### BackButton:

```tsx
// Показать кнопку "Назад"
useEffect(() => {
  if (webApp?.BackButton) {
    webApp.BackButton.show();
    webApp.BackButton.onClick(() => {
      // Действие назад
    });
  }
  
  return () => {
    webApp?.BackButton.hide();
  };
}, [webApp]);
```

## 🎯 Интеграция с компонентами

### Модули обучения с haptic feedback:

```tsx
<Button
  onClick={() => {
    haptic?.light();
    setCurrentModule(module.id);
  }}
>
  Открыть модуль
</Button>
```

### Навигация с selection feedback:

```tsx
<button
  onClick={() => {
    haptic?.selection();
    setActiveTab(tab.id);
  }}
>
  {tab.name}
</button>
```

### Успешное завершение урока:

```tsx
const handleLessonComplete = () => {
  haptic?.success();
  // Показать completion screen
};
```

## 📱 Telegram UI Components

Можно использовать готовые Telegram UI компоненты:

```tsx
import { AppRoot, Button, Cell, List } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

<AppRoot>
  <List>
    <Cell>Урок 1</Cell>
    <Cell>Урок 2</Cell>
  </List>
</AppRoot>
```

## 🔧 Конфигурация

### index.html - Meta tags:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#3390EC">
```

### BotFather настройки:

1. Создайте Web App URL в BotFather
2. Установите Menu Button
3. Настройте описание и картинку

```
/newbot - создать бота
/setmenubutton - установить кнопку меню
/setdescription - описание
/setuserpic - аватар
```

## 🎨 Адаптация под Telegram

### Скругленные углы:
```css
--radius: 0.75rem; /* Telegram-style */
```

### Тени:
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Цвета кнопок:
```css
--telegram-button: 213 89% 54%;
--telegram-button-text: 0 0% 100%;
```

## 📊 Analytics

Можно отслеживать события через Telegram:

```tsx
webApp?.sendData(JSON.stringify({
  event: 'lesson_completed',
  lesson_id: 'boundaries_1',
  xp_earned: 50
}));
```

## 🔐 Безопасность

Всегда проверяйте `initDataUnsafe`:

```tsx
if (webApp?.initDataUnsafe) {
  // Отправить на сервер для валидации
  const response = await fetch('/api/validate-telegram-data', {
    method: 'POST',
    body: JSON.stringify(webApp.initDataUnsafe)
  });
}
```

## 🐛 Debugging

### Проверка Telegram окружения:

```tsx
console.log('Is in Telegram:', isInTelegram);
console.log('WebApp version:', webApp?.version);
console.log('Platform:', webApp?.platform);
console.log('Color scheme:', colorScheme);
```

### Test в браузере:

Добавьте mock данные для разработки:

```tsx
if (!window.Telegram?.WebApp) {
  window.Telegram = {
    WebApp: {
      // Mock implementation
      ready: () => {},
      expand: () => {},
      // ...
    }
  };
}
```

## 📱 Responsive Design

Приложение автоматически адаптируется под Telegram:

```tsx
// Высота viewport учитывает Telegram UI
const height = webApp?.viewportHeight || window.innerHeight;
```

## 🎉 Результат

✅ Нативный Telegram UI/UX
✅ Тактильная обратная связь
✅ Автоматическая тема
✅ Доступ к данным пользователя
✅ MainButton и BackButton
✅ Haptic feedback
✅ Плавные анимации

---

Создано для идеальной интеграции с Telegram 💙
