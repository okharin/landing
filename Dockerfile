# Используем Node.js как базовый образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Устанавливаем serve для раздачи статических файлов
RUN npm install -g serve

# Открываем порт 8080
EXPOSE 8080

# Запускаем приложение
CMD ["serve", "-s", "dist", "-l", "8080"] 