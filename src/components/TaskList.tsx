import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Trash2, Download, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AddTaskModal } from './AddTaskModal';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  inputFile: string;
  outputFiles: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedResults, setExpandedResults] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Необходима авторизация');
        return;
      }

      const { id } = JSON.parse(userData);
      const response = await fetch('http://localhost:3000/api/tasks', {
        headers: {
          'user-id': id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке задач');
      }

      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке задач');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async (title: string, file: File) => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('Необходима авторизация');
      return;
    }

    const { id } = JSON.parse(userData);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    console.log('Отправляем запрос на создание задачи:', {
      title,
      fileName: file.name,
      userId: id
    });

    try {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'user-id': id.toString()
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка при создании задачи:', errorData);
        throw new Error(errorData.error || 'Ошибка при создании задачи');
      }

      const task = await response.json();
      console.log('Задача успешно создана:', task);
      await fetchTasks();
    } catch (err) {
      console.error('Ошибка при создании задачи:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('Необходима авторизация');
      return;
    }

    try {
      const { id } = JSON.parse(userData);
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'user-id': id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении задачи');
      }

      await fetchTasks();
    } catch (err) {
      setError('Ошибка при удалении задачи');
    }
  };

  const handleDownloadFile = async (filename: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('Необходима авторизация');
      return;
    }

    try {
      const { id } = JSON.parse(userData);
      const response = await fetch(`http://localhost:3000/api/files/${filename}`, {
        headers: {
          'user-id': id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Ошибка при загрузке файла');
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'PROCESSING':
        return 'В обработке';
      case 'COMPLETED':
        return 'Завершено';
      case 'FAILED':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const toggleResults = (taskId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Функция для определения, должны ли быть видны результаты
  const shouldShowResults = (task: Task) => {
    return task.status === 'PROCESSING' || expandedResults[task.id];
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentTasks = () => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  };

  const getTotalPages = () => Math.ceil(filteredTasks.length / tasksPerPage);

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию задачи..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="ml-4">
          <AddTaskModal onAddTask={handleAddTask} />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-4">
          {searchQuery ? 'Задачи не найдены' : 'Нет задач'}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {getCurrentTasks().map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(task.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{getStatusText(task.status)}</span>
                </div>

                {task.status === 'PROCESSING' && (
                  <div className="space-y-1">
                    <Progress value={task.progress} />
                    <p className="text-sm text-gray-500">{task.progress}%</p>
                  </div>
                )}

                {task.outputFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Результаты ({task.outputFiles.length} {task.outputFiles.length === 1 ? 'файл' : 'файлов'}):
                      </p>
                      {task.status !== 'PROCESSING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleResults(task.id)}
                          className="flex items-center space-x-1"
                        >
                          {expandedResults[task.id] ? (
                            <>
                              <span>Скрыть</span>
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <span>Показать</span>
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {shouldShowResults(task) && (
                      <div className="flex flex-wrap gap-2">
                        {task.outputFiles.map((file, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(file)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Скачать файл {index + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Задач на странице:</span>
              <Select
                value={tasksPerPage.toString()}
                onValueChange={(value) => {
                  setTasksPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Страница {currentPage} из {getTotalPages()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                disabled={currentPage === getTotalPages()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 