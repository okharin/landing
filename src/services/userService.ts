import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const API_URL = 'http://localhost:3000/api';

export const userService = {
  async createUser(data: CreateUserData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при создании пользователя');
    }

    return response.json();
  },

  async login(data: LoginData) {
    console.log('Отправка запроса на авторизацию:', data);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Ошибка авторизации:', error);
      throw new Error(error.error || 'Ошибка при авторизации');
    }

    const userData = await response.json();
    console.log('Получен ответ от сервера:', userData);
    return userData;
  },

  async getUserById(id: number) {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при получении информации о пользователе');
    }

    return response.json();
  },
}; 