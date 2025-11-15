# 🎨 Философия дизайна MyTeens.Space (из da-teens)

## ✨ Ключевые принципы

### 1. **Glassmorphism & Liquid Glass**
Основа визуального языка - эффект размытого стекла, создающий ощущение глубины и легкости.

**Технические детали:**
```css
backdrop-blur-[20px] /* Основное размытие */
backdrop-blur-[40px] /* Сильное размытие для навигации */
bg-white/60 /* 60% прозрачности */
bg-white/70 /* 70% для более плотных элементов */
border border-white/20 /* Тонкая светлая граница */
shadow-[0_8px_32px_rgba(0,0,0,0.12)] /* Мягкая тень */
```

**Применение:**
- Карточки уроков: `bg-white/60 backdrop-blur-[20px]`
- Навигация: `bg-white/70 backdrop-blur-[40px]`
- Модальные окна: `bg-white/80 backdrop-blur-[60px]`
- Feedback overlay: `bg-white/90 backdrop-blur-[80px]`

### 2. **iOS-стиль карточек**
Скругленные углы, мягкие тени, минималистичная анимация.

**Паттерны:**
```css
rounded-2xl /* 16px - стандарт для карточек */
rounded-3xl /* 24px - для больших блоков */
rounded-[28px] /* 28px - для навигации */
rounded-[32px] /* 32px - для hero sections */

shadow-ios-soft: 0_8px_32px_rgba(0,0,0,0.12)
shadow-[0_20px_60px_-25px_rgba(79,70,229,0.25)] /* Цветная тень */
```

### 3. **Мягкие градиенты**
Никаких резких переходов - только плавные, органические градиенты.

**Цветовая палитра:**
```css
/* Boundaries (Purple-Pink) */
from-purple-50 via-pink-50 to-purple-50
from-purple-500 to-pink-500

/* Confidence (Blue-Cyan) */
from-blue-50 via-cyan-50 to-blue-50
from-blue-500 to-cyan-500

/* Emotions (Pink-Rose) */
from-pink-50 via-rose-50 to-pink-50
from-pink-500 to-rose-500

/* Relationships (Green-Emerald) */
from-green-50 via-emerald-50 to-green-50
from-green-500 to-emerald-500

/* Background orbs (анимированные) */
bg-purple-400/10 blur-3xl
bg-blue-400/10 blur-3xl
bg-pink-400/10 blur-3xl
```

### 4. **Organic Animations**
Все анимации должны быть плавными, с физикой пружины.

**Framer Motion настройки:**
```typescript
// Стандартная анимация
transition={{ 
  type: "spring", 
  stiffness: 400, 
  damping: 17 
}}

// Медленная, органическая
transition={{ 
  type: "spring", 
  stiffness: 260, 
  damping: 20 
}}

// Фоновые orbs
transition={{
  duration: 20,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

### 5. **Animated Background Orbs**
Живой фон с плавающими размытыми кругами.

**Реализация:**
```tsx
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <motion.div
    className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.1, 0.2, 0.1],
      x: [0, 50, 0],
      y: [0, 30, 0]
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
  {/* Еще 2-3 orb с разными позициями */}
</div>
```

### 6. **Эмпатичные цвета feedback**
Никаких резких красных/зеленых - только мягкие градиенты.

**Feedback палитра:**
```css
/* Excellent - Emerald */
from-emerald-50 to-emerald-100
text-emerald-700
border-emerald-200

/* Good - Blue */
from-blue-50 to-blue-100
text-blue-700
border-blue-200

/* Needs Work - Rose (не red!) */
from-rose-50 to-rose-100
text-rose-700
border-rose-200
```

### 7. **Микро-взаимодействия**
Каждое действие имеет визуальный отклик.

**Примеры:**
- Hover: `whileHover={{ scale: 1.02, y: -2 }}`
- Tap: `whileTap={{ scale: 0.98 }}`
- Focus: `ring-2 ring-purple-200 ring-offset-2`
- Progress fill: gradient animation

### 8. **Typography - iOS San Francisco style**
Использование системных шрифтов с iOS-стилем.

**Классы:**
```css
.ios-headline {
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.ios-title {
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.ios-body {
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
}

.ios-caption {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.4;
  color: rgba(0,0,0,0.6);
}
```

## 📱 Responsive Design

**Телеграм WebApp размеры:**
- Ширина: 390px (iPhone 14 Pro)
- Высота: 660px (viewport без навигации)

**Breakpoints:**
```css
sm: 640px   /* Малые планшеты */
md: 768px   /* Средние планшеты */
lg: 1024px  /* Десктоп */
```

**Safe areas:**
```css
pb-safe /* padding-bottom для iPhone notch */
```

## 🎯 Best Practices из da-teens

1. **Никогда не используй чистый white** - всегда `bg-white/60-90` с backdrop-blur
2. **Тени всегда мягкие** - rgba с альфой 0.08-0.15
3. **Анимации всегда spring** - никаких linear/ease
4. **Скругления консистентны** - 16px/24px/32px
5. **Градиенты всегда трехцветные** - from-via-to
6. **Feedback никогда не резкий** - emerald/blue/rose вместо green/blue/red
7. **Микро-анимации везде** - hover, tap, focus
8. **Spacing последовательный** - 4px, 8px, 12px, 16px, 24px, 32px

## 🔄 Примеры трансформации

### ❌ До (резкий стиль):
```tsx
<div className="bg-white rounded-lg shadow-md p-4 border">
  <h3 className="text-lg font-bold text-gray-900">Title</h3>
</div>
```

### ✅ После (glassmorphism):
```tsx
<motion.div 
  className="bg-white/60 backdrop-blur-[20px] rounded-2xl p-4 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
  whileHover={{ scale: 1.02, y: -2 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  <h3 className="ios-title text-gray-900">Title</h3>
</motion.div>
```

## 🎨 Компонентная библиотека

### Карточка урока:
```tsx
<motion.div
  className="bg-white/60 backdrop-blur-[20px] rounded-3xl p-6 border border-white/20 shadow-[0_20px_60px_-25px_rgba(79,70,229,0.25)]"
  whileHover={{ y: -4 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  {/* Gradient header */}
  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4" />
  
  {/* Content */}
  <h3 className="ios-headline text-gray-900 mb-2">Lesson Title</h3>
  <p className="ios-body text-gray-600 mb-4">Description</p>
  
  {/* Footer with stats */}
  <div className="flex items-center gap-3 text-xs">
    <span className="flex items-center gap-1">
      <Star weight="fill" className="text-yellow-500" />
      100 XP
    </span>
  </div>
</motion.div>
```

### Кнопка действия:
```tsx
<motion.button
  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Начать урок
</motion.button>
```

### Прогресс бар:
```tsx
<div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
  <motion.div
    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
  />
</div>
```

---

**Версия:** 1.0  
**Дата:** 15 ноября 2025  
**Источник:** da-teens-webapp-tele философия дизайна  
**Применить к:** Все компоненты MyTeens.Space
