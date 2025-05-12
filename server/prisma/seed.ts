import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли уже администратор
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminExists) {
    // Создаем администратора
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@duomind.ru',
        password: hashedPassword,
        name: 'Администратор',
        role: 'ADMIN',
        company: 'DuoMind'
      }
    });
    console.log('Администратор создан');
  } else {
    console.log('Администратор уже существует');
  }
}

main()
  .catch((e) => {
    console.error('Ошибка при инициализации базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 