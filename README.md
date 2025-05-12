# DuoMind

Веб-приложение для обработки и анализа данных с использованием искусственного интеллекта.

## Структура проекта

- `frontend/` - React приложение
- `server/` - Node.js бэкенд
- `server/prisma/` - Схема базы данных и миграции

## Требования

- Docker и Docker Compose
- Node.js 20+
- PostgreSQL 15+

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/duomind.git
cd duomind
```

2. Создайте файл `.env` в корневой директории:
```env
# Настройки почты
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@example.com

# База данных
DATABASE_URL=postgresql://postgres:postgres@db:5432/duomind

# JWT
JWT_SECRET=your-secret-key
```

3. Запустите приложение:
```bash
docker-compose up -d
```

Приложение будет доступно по адресам:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## Доступ к админ-панели

После первого запуска создается администратор со следующими данными:
- Email: admin@duomind.ru
- Пароль: admin123

## Разработка

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

## Лицензия

MIT 