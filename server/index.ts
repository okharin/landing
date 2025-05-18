import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 МБ в байтах
  },
  fileFilter: (req, file, cb) => {
    // Проверяем расширение файла
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы Excel (.xlsx, .xls)'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Обработчик ошибок multer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла не должен превышать 100 МБ' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Расширяем интерфейс Request для добавления пользователя
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
  file?: Express.Multer.File;
}

// Конфигурация nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // используем SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // здесь должен быть пароль приложения, а не обычный пароль
  },
  tls: {
    rejectUnauthorized: false // для разработки можно отключить проверку сертификата
  }
});

// Проверяем подключение при запуске сервера
transporter.verify(function(error, success) {
  if (error) {
    console.error('Ошибка подключения к SMTP серверу:', error);
  } else {
    console.log('SMTP сервер готов к отправке писем');
  }
});

// Middleware для проверки авторизации
const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['user-id'];
  console.log('Проверка авторизации, получен user-id:', userId);

  if (!userId) {
    console.log('Отсутствует user-id в заголовках');
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }

  prisma.user.findUnique({
    where: { id: Number(userId) },
  })
    .then(user => {
      if (!user) {
        console.log('Пользователь не найден:', userId);
        res.status(401).json({ error: 'Пользователь не найден' });
        return;
      }
      console.log('Пользователь найден:', user);
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Ошибка при поиске пользователя:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    });
};

// Middleware для проверки прав администратора
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Требуются права администратора' });
    return;
  }
  next();
};
// Авторизация
app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  console.log('Получен запрос на авторизацию:', { email });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Пользователь не найден:', email);
      res.status(400).json({ error: 'Пользователь не найден' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Неверный пароль для пользователя:', email);
      res.status(400).json({ error: 'Неверный пароль' });
      return;
    }

    const userData = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      company: user.company,
      role: user.role 
    };
    console.log('Успешная авторизация, отправляем данные:', userData);
    res.json(userData);
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});


// Регистрация
app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, company } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Пользователь уже существует' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        role: 'USER',
      },
    });

    // Отправка приветственного письма
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Добро пожаловать в DuoMind!',
      html: `
        <h1>Добро пожаловать, ${name}!</h1>
        <p>Спасибо за регистрацию в DuoMind. Мы рады видеть вас в нашем сообществе.</p>
      `,
    });

    res.json({ id: user.id, email: user.email, name: user.name, company: user.company, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});


// Получение списка пользователей (только для админов)
app.get('/api/users', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка пользователей' });
  }
});

// Создание нового пользователя (только для админов)
app.post('/api/users', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password, name, company, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

// Обновление пользователя (только для админов)
app.patch('/api/users/:id', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, password, name, company, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== Number(id)) {
      res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      return;
    }

    const updateData: any = {
      email,
      name,
      company,
      role,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

// Удаление пользователя (только для админов)
app.delete('/api/users/:id', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

// Обработка формы обратной связи
app.post('/api/contact', async (req: Request, res: Response): Promise<void> => {
  const { name, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Новое сообщение с сайта',
      html: `
        <h2>Новое сообщение от ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ message: 'Сообщение успешно отправлено' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// Получение списка задач пользователя
app.get('/api/tasks', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка задач' });
  }
});

// Создание новой задачи
app.post('/api/tasks', authenticateUser, upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log('Получен запрос на создание задачи:', {
    body: req.body,
    file: req.file,
    user: req.user,
    headers: req.headers
  });

  const { title, userName, userEmail, userCompany } = req.body;
  const file = req.file;

  if (!file) {
    console.log('Файл не был загружен');
    res.status(400).json({ error: 'Файл не был загружен' });
    return;
  }

  try {
    // Проверяем уникальность названия задачи для текущего пользователя
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: req.user!.id,
        title: title
      }
    });

    if (existingTask) {
      res.status(400).json({ error: 'Задача с таким названием уже существует' });
      return;
    }

    console.log('Создаем задачу в БД:', {
      title,
      inputFile: file.path,
      userId: req.user!.id,
      userName,
      userEmail,
      userCompany
    });

    const task = await prisma.task.create({
      data: {
        title,
        inputFile: file.path,
        userId: req.user!.id,
        status: 'PENDING',
        progress: 0,
        outputFiles: [],
        userInfo: {
          name: userName,
          email: userEmail,
          company: userCompany
        }
      },
    });

    console.log('Задача создана:', task);

    // Запускаем обработку файла в фоновом режиме
    processExcelFile(task.id, file.path).catch(error => {
      console.error('Ошибка при обработке файла:', error);
    });

    res.json(task);
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки:', {
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ error: 'Ошибка при создании задачи' });
  }
});

// Получение файла
app.get('/api/files/:filename', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  try {
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Файл не найден' });
      return;
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при скачивании файла' });
  }
});

// Функция для обработки Excel файла
async function processExcelFile(taskId: number, filePath: string) {
  console.log('=== Начало обработки файла ===');
  console.log('Параметры:', { taskId, filePath });
  
  try {
    // Проверяем существование файла
    console.log('Проверка существования файла...');
    if (!fs.existsSync(filePath)) {
      console.error('Файл не найден:', filePath);
      throw new Error(`Файл не найден: ${filePath}`);
    }
    console.log('Файл существует');

    // Обновляем статус задачи на "В обработке"
    console.log('Обновление статуса задачи на PROCESSING...');
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'PROCESSING' }
    });
    console.log('Статус обновлен');

    // Проверяем формат файла
    console.log('Проверка формата файла...');
    const fileExt = path.extname(filePath).toLowerCase();
    console.log('Расширение файла:', fileExt);
    if (!['.xlsx', '.xls'].includes(fileExt)) {
      console.error('Неподдерживаемый формат файла:', fileExt);
      throw new Error(`Неподдерживаемый формат файла: ${fileExt}`);
    }
    console.log('Формат файла поддерживается');

    // Читаем Excel файл
    console.log('Начинаем чтение Excel файла...');
    const workbook = xlsx.readFile(filePath);
    console.log('Excel файл успешно прочитан');
    console.log('Доступные листы:', workbook.SheetNames);

    // Создаем директорию для выходных файлов, если она не существует
    const outputDir = path.join(__dirname, 'uploads');
    console.log('Проверка директории для выходных файлов:', outputDir);
    if (!fs.existsSync(outputDir)) {
      console.log('Создаем директорию...');
      fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log('Директория готова');

    const outputFiles = [];

    // Создаем 3 выходных файла с интервалом в 10 секунд
    for (let i = 1; i <= 3; i++) {
      console.log(`Создание файла ${i} из 3...`);
      
      // Создаем выходной файл
      const outputFileName = `output_${taskId}_${i}${fileExt}`;
      const outputPath = path.join(outputDir, outputFileName);
      console.log('Создаем выходной файл:', outputPath);

      // Записываем данные в выходной файл
      console.log('Записываем данные в выходной файл...');
      xlsx.writeFile(workbook, outputPath);
      console.log('Данные записаны');

      outputFiles.push(outputFileName);

      // Обновляем прогресс
      const progress = Math.round((i / 3) * 100);
      await prisma.task.update({
        where: { id: taskId },
        data: { 
          progress,
          outputFiles
        }
      });
      console.log(`Прогресс обновлен: ${progress}%`);

      if (i < 3) {
        console.log('Ожидаем 10 секунд перед созданием следующего файла...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('10 секунд прошли');
      }
    }

    // Обновляем статус задачи на "Завершено"
    console.log('Обновление статуса задачи на COMPLETED...');
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        progress: 100
      }
    });
    console.log('=== Задача успешно завершена ===');
  } catch (error) {
    console.error('=== Ошибка при обработке файла ===');
    console.error('Детали ошибки:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }
    });
    console.log('Статус задачи обновлен на FAILED');
  }
}

// Обновление задачи
app.patch('/api/tasks/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      res.status(404).json({ error: 'Задача не найдена' });
      return;
    }

    if (task.userId !== req.user!.id) {
      res.status(403).json({ error: 'Нет доступа к этой задаче' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

// Удаление задачи
app.delete('/api/tasks/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      res.status(404).json({ error: 'Задача не найдена' });
      return;
    }

    if (task.userId !== req.user!.id) {
      res.status(403).json({ error: 'Нет доступа к этой задаче' });
      return;
    }

    await prisma.task.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
});

// Получение статистики по задачам
app.get('/api/analytics', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const whereClause = isAdmin ? {} : { userId: req.user!.id };

    const totalTasks = await prisma.task.count({
      where: whereClause
    });

    const completedTasks = await prisma.task.count({
      where: { 
        ...whereClause,
        status: 'COMPLETED'
      }
    });

    const failedTasks = await prisma.task.count({
      where: { 
        ...whereClause,
        status: 'FAILED'
      }
    });

    const processingTasks = await prisma.task.count({
      where: { 
        ...whereClause,
        status: 'PROCESSING'
      }
    });

    const pendingTasks = await prisma.task.count({
      where: { 
        ...whereClause,
        status: 'PENDING'
      }
    });

    // Получаем статистику по дням за последние 7 дней
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const tasksByDay = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const count = await prisma.task.count({
          where: {
            ...whereClause,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        return {
          date,
          count
        };
      })
    );

    res.json({
      totalTasks,
      completedTasks,
      failedTasks,
      processingTasks,
      pendingTasks,
      tasksByDay,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Обработка заявки на демо
app.post('/api/send-demo-request', async (req: Request, res: Response): Promise<void> => {
  const { name, email, company, phone, message } = req.body;

  try {
    // Отправляем уведомление администратору
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Новая заявка на демо',
      html: `
        <h2>Новая заявка на демо от ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Компания:</strong> ${company || 'Не указана'}</p>
        <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message || 'Не указано'}</p>
      `,
    });

    // Отправляем подтверждение клиенту
    /*
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Ваша заявка на демо DuoMind принята',
      html: `
        <h1>Спасибо за интерес к DuoMind, ${name}!</h1>
        <p>Мы получили вашу заявку на демонстрацию и свяжемся с вами в ближайшее время.</p>
        <p>С уважением,<br>Команда DuoMind</p>
      `,
    });
    */

    res.json({ message: 'Заявка успешно отправлена' });
  } catch (error) {
    console.error('Ошибка при отправке заявки на демо:', error);
    res.status(500).json({ error: 'Ошибка при отправке заявки' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
}); 