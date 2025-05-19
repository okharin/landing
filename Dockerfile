# Этап сборки
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап production
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 8080
EXPOSE 8080

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 