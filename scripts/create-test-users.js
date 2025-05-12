import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10),
        name: 'Тестовый Пользователь',
        role: 'USER'
      }
    });

    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Администратор',
        role: 'ADMIN'
      }
    });

    console.log('Тестовые пользователи созданы:');
    console.log('Тестовый пользователь:', testUser.email);
    console.log('Администратор:', admin.email);
  } catch (error) {
    console.error('Ошибка при создании тестовых пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers(); 