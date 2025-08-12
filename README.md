# ⚽ Футбольные прогнозы - Betting System!

Система прогнозов на спортивные матчи с рейтингом игроков и автоматическим подсчетом очков.

## 🚀 Быстрый старт

```sh
# Клонирование репозитория
git clone https://github.com/meteor-42/bet
cd bet

# Установка зависимостей
bun install

# Запуск сервера разработки
bun run dev
```

## 🛠 Технологический стек

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Package Manager**: Bun

## 📁 Структура проекта

```
bet/
├── 📄 Корневые конфигурационные файлы
│   ├── .env                      # Переменные окружения (локальная копия .env.example)
│   ├── .env.example             # Пример конфигурации с Supabase ключами
│   ├── .gitignore               # Файлы исключенные из Git
│   ├── README.md                # Документация проекта (этот файл)
│   ├── bun.lockb                # Заблокированные версии зависимостей (Bun)
│   ├── components.json          # Конфигурация shadcn/ui компонентов
│   ├── eslint.config.js         # Настройки ESLint для проверки кода
│   ├── index.html               # HTML шаблон для Vite
│   ├── package.json             # Зависимости и скрипты проекта
│   ├── postcss.config.js        # Конфигурация PostCSS для обработки CSS
│   ├── tailwind.config.ts       # Настройки Tailwind CSS
│   ├── tsconfig.json            # Основная конфигурация TypeScript
│   ├── tsconfig.app.json        # TypeScript конфигурация для приложения
│   ├── tsconfig.node.json       # TypeScript конфигурация для Node.js
│   └── vite.config.ts           # Конфигурация Vite bundler
│
├── 🗂 public/                   # Статические ресурсы
│   ├── favicon.ico              # Иконка сайта
│   ├── placeholder.svg          # Заглушка для изображений
│   └── robots.txt               # Инструкции для поисковых роботов
│
├── 🗄 supabase/                 # База данных
│   └── migrations/              # SQL миграции
│       └── 00000000000000_initial_setup.sql  # Единая миграция с полной структурой БД
│
├── 📝 src/                      # Исходный код приложения
│   ├── 🎨 Основные файлы
│   │   ├── App.tsx              # Главный компонент приложения с роутингом
│   │   ├── App.css              # Глобальные стили приложения
│   │   ├── main.tsx             # Точка входа React приложения
│   │   ├── index.css            # Базовые стили и Tailwind импорты
│   │   └── vite-env.d.ts        # TypeScript декларации для Vite
│   │
│   ├── 🧩 components/           # React компоненты
│   │   ├── 📋 Основные компоненты приложения
│   │   │   ├── AdminPanel.tsx       # Админ-панель для управления матчами/игроками
│   │   │   ├── GameRules.tsx        # Компонент с правилами игры
│   │   │   ├── Header.tsx           # Шапка сайта с навигацией
│   │   │   ├── Leaderboard.tsx      # Таблица лидеров с рейтингом игроков
│   │   │   ├── MatchCard.tsx        # Карточка матча для отображения ставок
│   │   │   ├── MatchSlider.tsx      # Слайдер с текущими матчами
│   │   │   ├── MyBets.tsx           # Компонент для отображения ставок пользователя
│   │   │   ├── PaginationControls.tsx # Элементы управления пагинацией
│   │   │   ├── ProtectedRoute.tsx   # Защищенный маршрут для авторизованных пользователей
│   │   │   └── StatsCard.tsx        # Карточка со статистикой игрока
│   │   │
│   │   └── 🎨 ui/               # shadcn/ui компоненты
│   │       ├── use-toast.ts         # Хук для уведомлений toast
│   │       ├── accordion.tsx        # Складываемые панели
│   │       ├── alert-dialog.tsx     # Модальные диалоги с подтверждением
│   │       ├── alert.tsx            # Компонент уведомлений
│   │       ├── aspect-ratio.tsx     # Контейнер с фиксированным соотношением сторон
│   │       ├── avatar.tsx           # Аватар пользователя
│   │       ├── badge.tsx            # Значки и метки
│   │       ├── breadcrumb.tsx       # Навигационные крошки
│   │       ├── button.tsx           # Кнопки с различными вариантами
│   │       ├── calendar.tsx         # Календарь для выбора дат
│   │       ├── card.tsx             # Карточки контента
│   │       ├── carousel.tsx         # Карусель/слайдер
│   │       ├── chart.tsx            # Компоненты для графиков
│   │       ├── checkbox.tsx         # Чекбоксы
│   │       ├── collapsible.tsx      # Сворачиваемые блоки
│   │       ├── command.tsx          # Командная палитра/поиск
│   │       ├── context-menu.tsx     # Контекстное меню
│   │       ├── dialog.tsx           # Модальные окна
│   │       ├── drawer.tsx           # Выдвижные панели
│   │       ├── dropdown-menu.tsx    # Выпадающие меню
│   │       ├── form.tsx             # Компоненты форм
│   │       ├── hover-card.tsx       # Карточки при наведении
│   │       ├── input-otp.tsx        # Поле ввода OTP кодов
│   │       ├── input.tsx            # Поля ввода
│   │       ├── label.tsx            # Подписи к полям форм
│   │       ├── menubar.tsx          # Панель меню
│   │       ├── navigation-menu.tsx  # Навигационное меню
│   │       ├── pagination.tsx       # Пагинация
│   │       ├── popover.tsx          # Всплывающие окна
│   │       ├── progress.tsx         # Индикаторы прогресса
│   │       ├── radio-group.tsx      # Группы радиокнопок
│   │       ├── resizable.tsx        # Изменяемые размеры панелей
│   │       ├── scroll-area.tsx      # Области с прокруткой
│   │       ├── select.tsx           # Выпадающие списки
│   │       ├── separator.tsx        # Разделители
│   │       ├── sheet.tsx            # Боковые панели
│   │       ├── sidebar.tsx          # Боковая навигация
│   │       ├── skeleton.tsx         # Заглушки при загрузке
│   │       ├── slider.tsx           # Ползунки
│   │       ├── sonner.tsx           # Система уведомлений Sonner
│   │       ├── switch.tsx           # Переключатели
│   │       ├── table.tsx            # Таблицы
│   │       ├── tabs.tsx             # Вкладки
│   │       ├── textarea.tsx         # Многострочные поля ввода
│   │       ├── toast.tsx            # Уведомления toast
│   │       ├── toaster.tsx          # Контейнер для toast уведомлений
│   │       ├── toggle-group.tsx     # Группы переключателей
│   │       ├── toggle.tsx           # Переключатели
│   │       └── tooltip.tsx          # Всплывающие подсказки
│   │
│   ├── 🗂 contexts/             # React контексты
│   │   └── AuthContext.tsx          # Контекст аутентификации пользователей
│   │
│   ├── 🎣 hooks/               # Пользовательские React хуки
│   │   ├── use-toast.ts             # Хук для системы уведомлений
│   │   ├── use-mobile.tsx           # Хук для определения мобильных устройств
│   │   ├── useBets.ts               # Хук для работы со ставками
│   │   ├── useLeaderboard.ts        # Хук для получения таблицы лидеров
│   │   ├── useMatches.ts            # Хук для работы с матчами
│   │   ├── usePagination.ts         # Хук для пагинации
│   │   └── usePlayerStats.ts        # Хук для статистики игроков
│   │
│   ├── 📚 lib/                 # Утилиты и конфигурации
│   │   ├── supabase.ts              # Настройка клиента Supabase
│   │   └── utils.ts                 # Вспомогательные функции (cn, clsx)
│   │
│   └── 📄 pages/               # Страницы приложения
│       ├── Index.tsx                # Главная страница с матчами и рейтингом
│       ├── Login.tsx                # Страница входа в систему
│       └── NotFound.tsx             # Страница 404 (не найдено)
│
└── 📁 .same/                   # Служебная папка Same IDE
    └── todos.md                     # Список задач и прогресс проекта
```

## 🗄️ Структура базы данных

### Таблица `matches` - Спортивные матчи
- `id` (uuid) - Уникальный идентификатор
- `home_team`, `away_team` - Команды
- `match_date`, `match_time` - Дата и время матча
- `league`, `stage` - Лига и этап турнира
- `status` - Статус (upcoming/live/finished)
- `home_score`, `away_score` - Счет матча
- `is_visible` - Видимость на главной странице

### Таблица `players` - Игроки и их статистика
- `id` (uuid) - Уникальный идентификатор
- `name`, `email`, `password` - Данные пользователя
- `role` - Роль (admin/player)
- `points` - Общие очки
- `correct_predictions` - Количество верных прогнозов
- `total_predictions` - Общее количество прогнозов
- `rank_position` - Позиция в рейтинге

### Таблица `bets` - Ставки игроков
- `id` (uuid) - Уникальный идентификатор
- `player_id`, `match_id` - Связи с игроком и матчем
- `predicted_home_score`, `predicted_away_score` - Прогноз счета
- `points_earned` - Заработанные очки
- `is_calculated` - Рассчитаны ли очки

## 🎯 Ключевые функции

### 🏆 Система подсчета очков
- **3 очка** - точный счет
- **1 очко** - правильный исход (победа/ничья/поражение)
- **0 очков** - неверный прогноз

### 👥 Роли пользователей
- **Admin** - управление матчами, игроками, просмотр всей статистики
- **Player** - создание прогнозов, просмотр рейтинга

### 🔄 Автоматизация
- Автоматический пересчет очков при завершении матча
- Обновление рейтинга игроков
- Триггеры для обновления временных меток

## 🔑 Демо-аккаунты

**Администратор:**
- Email: `admin@rpl.com`
- Пароль: `admin123`

**Игрок:**
- Email: `alex.chen@example.com`
- Пароль: `password123`

## 📝 Команды для разработки

```bash
# Запуск в режиме разработки
bun run dev

# Сборка для продакшена
bun run build

# Линтинг кода
bun run lint

# Предварительный просмотр сборки
bun run preview
```

## 🌐 URL
Приложение доступно по адресу: http://localhost:8080

---

**Разработано с использованием React + TypeScript + Supabase**
