"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var client_1 = require("@prisma/client");
var nodemailer_1 = require("nodemailer");
var bcrypt_1 = require("bcrypt");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var xlsx_1 = require("xlsx");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var app = (0, express_1.default)();
var prisma = new client_1.PrismaClient();
var port = process.env.PORT || 3000;
// Настройка multer для загрузки файлов
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = path_1.default.join(__dirname, 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
var upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        }
        else {
            cb(new Error('Только Excel файлы (.xlsx) разрешены'));
        }
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Конфигурация nodemailer
var transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Middleware для проверки авторизации
var authenticateUser = function (req, res, next) {
    var userId = req.headers['user-id'];
    if (!userId) {
        res.status(401).json({ error: 'Требуется авторизация' });
        return;
    }
    prisma.user.findUnique({
        where: { id: Number(userId) },
    })
        .then(function (user) {
        if (!user) {
            res.status(401).json({ error: 'Пользователь не найден' });
            return;
        }
        req.user = user;
        next();
    })
        .catch(function () {
        res.status(500).json({ error: 'Ошибка сервера' });
    });
};
// Middleware для проверки прав администратора
var requireAdmin = function (req, res, next) {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        res.status(403).json({ error: 'Требуются права администратора' });
        return;
    }
    next();
};
// Регистрация
app.post('/api/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name, company, existingUser, hashedPassword, user, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password, name = _a.name, company = _a.company;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { email: email },
                    })];
            case 2:
                existingUser = _b.sent();
                if (existingUser) {
                    res.status(400).json({ error: 'Пользователь уже существует' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                hashedPassword = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: email,
                            password: hashedPassword,
                            name: name,
                            company: company,
                            role: 'USER',
                        },
                    })];
            case 4:
                user = _b.sent();
                // Отправка приветственного письма
                return [4 /*yield*/, transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Добро пожаловать в DuoMind!',
                        html: "\n        <h1>\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C, ".concat(name, "!</h1>\n        <p>\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E \u0432 DuoMind. \u041C\u044B \u0440\u0430\u0434\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0432\u0430\u0441 \u0432 \u043D\u0430\u0448\u0435\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u0435.</p>\n      "),
                    })];
            case 5:
                // Отправка приветственного письма
                _b.sent();
                res.json({ id: user.id, email: user.email, name: user.name, company: user.company, role: user.role });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                res.status(500).json({ error: 'Ошибка при регистрации' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Авторизация
app.post('/api/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, validPassword, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { email: email },
                    })];
            case 2:
                user = _b.sent();
                if (!user) {
                    res.status(400).json({ error: 'Пользователь не найден' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 3:
                validPassword = _b.sent();
                if (!validPassword) {
                    res.status(400).json({ error: 'Неверный пароль' });
                    return [2 /*return*/];
                }
                res.json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    company: user.company,
                    role: user.role
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                res.status(500).json({ error: 'Ошибка при входе' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Получение списка пользователей (только для админов)
app.get('/api/users', authenticateUser, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.user.findMany({
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            company: true,
                            role: true,
                        },
                    })];
            case 1:
                users = _a.sent();
                res.json(users);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: 'Ошибка при получении списка пользователей' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Создание нового пользователя (только для админов)
app.post('/api/users', authenticateUser, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name, company, role, existingUser, hashedPassword, user, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password, name = _a.name, company = _a.company, role = _a.role;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { email: email },
                    })];
            case 2:
                existingUser = _b.sent();
                if (existingUser) {
                    res.status(400).json({ error: 'Пользователь с таким email уже существует' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                hashedPassword = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: email,
                            password: hashedPassword,
                            name: name,
                            company: company,
                            role: role,
                        },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            company: true,
                            role: true,
                        },
                    })];
            case 4:
                user = _b.sent();
                res.json(user);
                return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                res.status(500).json({ error: 'Ошибка при создании пользователя' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Обновление пользователя (только для админов)
app.patch('/api/users/:id', authenticateUser, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, email, password, name, company, role, existingUser, updateData, _b, user, error_5;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                id = req.params.id;
                _a = req.body, email = _a.email, password = _a.password, name = _a.name, company = _a.company, role = _a.role;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, , 7]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { email: email },
                    })];
            case 2:
                existingUser = _c.sent();
                if (existingUser && existingUser.id !== Number(id)) {
                    res.status(400).json({ error: 'Пользователь с таким email уже существует' });
                    return [2 /*return*/];
                }
                updateData = {
                    email: email,
                    name: name,
                    company: company,
                    role: role,
                };
                if (!password) return [3 /*break*/, 4];
                _b = updateData;
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                _b.password = _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, prisma.user.update({
                    where: { id: Number(id) },
                    data: updateData,
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        company: true,
                        role: true,
                    },
                })];
            case 5:
                user = _c.sent();
                res.json(user);
                return [3 /*break*/, 7];
            case 6:
                error_5 = _c.sent();
                res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Удаление пользователя (только для админов)
app.delete('/api/users/:id', authenticateUser, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.user.delete({
                        where: { id: Number(id) },
                    })];
            case 2:
                _a.sent();
                res.json({ message: 'Пользователь успешно удален' });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                res.status(500).json({ error: 'Ошибка при удалении пользователя' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Обработка формы обратной связи
app.post('/api/contact', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, message, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, message = _a.message;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: process.env.EMAIL_USER,
                        subject: 'Новое сообщение с сайта',
                        html: "\n        <h2>\u041D\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 ".concat(name, "</h2>\n        <p><strong>Email:</strong> ").concat(email, "</p>\n        <p><strong>\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435:</strong></p>\n        <p>").concat(message, "</p>\n      "),
                    })];
            case 2:
                _b.sent();
                res.json({ message: 'Сообщение успешно отправлено' });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                res.status(500).json({ error: 'Ошибка при отправке сообщения' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Получение списка задач пользователя
app.get('/api/tasks', authenticateUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tasks, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.task.findMany({
                        where: { userId: req.user.id },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                tasks = _a.sent();
                res.json(tasks);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                res.status(500).json({ error: 'Ошибка при получении списка задач' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Создание новой задачи
app.post('/api/tasks', authenticateUser, upload.single('file'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var title, file, task, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                title = req.body.title;
                file = req.file;
                if (!file) {
                    res.status(400).json({ error: 'Файл не был загружен' });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.task.create({
                        data: {
                            title: title,
                            inputFile: file.path,
                            userId: req.user.id,
                        },
                    })];
            case 2:
                task = _a.sent();
                // Запускаем обработку файла в фоновом режиме
                processExcelFile(task.id, file.path);
                res.json(task);
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                res.status(500).json({ error: 'Ошибка при создании задачи' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Получение файла
app.get('/api/files/:filename', authenticateUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, filePath;
    return __generator(this, function (_a) {
        filename = req.params.filename;
        filePath = path_1.default.join(__dirname, 'uploads', filename);
        try {
            if (!fs_1.default.existsSync(filePath)) {
                res.status(404).json({ error: 'Файл не найден' });
                return [2 /*return*/];
            }
            res.download(filePath);
        }
        catch (error) {
            res.status(500).json({ error: 'Ошибка при скачивании файла' });
        }
        return [2 /*return*/];
    });
}); });
// Функция для обработки Excel файла
function processExcelFile(taskId, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var workbook, sheetName, worksheet, data, outputFiles, totalSteps, i, outputPath, newWorkbook, newWorksheet, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 9]);
                    // Обновляем статус задачи на "в обработке"
                    return [4 /*yield*/, prisma.task.update({
                            where: { id: taskId },
                            data: { status: 'PROCESSING' }
                        })];
                case 1:
                    // Обновляем статус задачи на "в обработке"
                    _a.sent();
                    workbook = xlsx_1.default.readFile(filePath);
                    sheetName = workbook.SheetNames[0];
                    worksheet = workbook.Sheets[sheetName];
                    data = xlsx_1.default.utils.sheet_to_json(worksheet);
                    outputFiles = [];
                    totalSteps = 3;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < totalSteps)) return [3 /*break*/, 5];
                    // Обновляем прогресс
                    return [4 /*yield*/, prisma.task.update({
                            where: { id: taskId },
                            data: { progress: Math.round(((i + 1) / totalSteps) * 100) }
                        })];
                case 3:
                    // Обновляем прогресс
                    _a.sent();
                    outputPath = path_1.default.join(__dirname, 'uploads', "result_".concat(taskId, "_").concat(i + 1, ".xlsx"));
                    newWorkbook = xlsx_1.default.utils.book_new();
                    newWorksheet = xlsx_1.default.utils.json_to_sheet(data);
                    xlsx_1.default.utils.book_append_sheet(newWorkbook, newWorksheet, 'Results');
                    xlsx_1.default.writeFile(newWorkbook, outputPath);
                    outputFiles.push(outputPath);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: 
                // Обновляем статус задачи на "завершено"
                return [4 /*yield*/, prisma.task.update({
                        where: { id: taskId },
                        data: {
                            status: 'COMPLETED',
                            progress: 100,
                            outputFiles: outputFiles
                        }
                    })];
                case 6:
                    // Обновляем статус задачи на "завершено"
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    error_10 = _a.sent();
                    // В случае ошибки обновляем статус задачи
                    return [4 /*yield*/, prisma.task.update({
                            where: { id: taskId },
                            data: { status: 'FAILED' }
                        })];
                case 8:
                    // В случае ошибки обновляем статус задачи
                    _a.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Обновление задачи
app.patch('/api/tasks/:id', authenticateUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, completed, task, updatedTask, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                completed = req.body.completed;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: Number(id) },
                    })];
            case 2:
                task = _a.sent();
                if (!task) {
                    res.status(404).json({ error: 'Задача не найдена' });
                    return [2 /*return*/];
                }
                if (task.userId !== req.user.id) {
                    res.status(403).json({ error: 'Нет доступа к этой задаче' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.task.update({
                        where: { id: Number(id) },
                        data: { completed: completed },
                    })];
            case 3:
                updatedTask = _a.sent();
                res.json(updatedTask);
                return [3 /*break*/, 5];
            case 4:
                error_11 = _a.sent();
                res.status(500).json({ error: 'Ошибка при обновлении задачи' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Удаление задачи
app.delete('/api/tasks/:id', authenticateUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, task, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: Number(id) },
                    })];
            case 2:
                task = _a.sent();
                if (!task) {
                    res.status(404).json({ error: 'Задача не найдена' });
                    return [2 /*return*/];
                }
                if (task.userId !== req.user.id) {
                    res.status(403).json({ error: 'Нет доступа к этой задаче' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.task.delete({
                        where: { id: Number(id) },
                    })];
            case 3:
                _a.sent();
                res.json({ message: 'Задача успешно удалена' });
                return [3 /*break*/, 5];
            case 4:
                error_12 = _a.sent();
                res.status(500).json({ error: 'Ошибка при удалении задачи' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("\u0421\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043D\u0430 \u043F\u043E\u0440\u0442\u0443 ".concat(port));
});
