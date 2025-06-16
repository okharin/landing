import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Trash2, Download, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AddTaskModal } from './AddTaskModal';
import { Input } from './ui/input';
import { ConfirmDialog } from './ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { API_URL } from '@/config/api';
import { useToast } from './ui/use-toast';

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  inputFiles: string;
  outputFiles: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  result?: string;
  checkType: string;
  error?: string;
  eans?: string;
  useKnowledge: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedResults, setExpandedResults] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchTasks = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Необходима авторизация');
        return;
      }

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/tasks?user_id=${id}`, {
        headers: {
          'user-id': id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке задач');
      }

      const data = await response.json();
      console.log('Получены задачи:', data.map((task: Task) => ({
        id: task.id,
        status: task.status,
        progress: task.progress,
        outputFiles: task.outputFiles
      })));

      // Проверяем изменения в задачах
      data.forEach((newTask: Task) => {
        const oldTask = tasks.find(t => t.id === newTask.id);
        if (oldTask && oldTask.progress !== newTask.progress) {
          console.log(`Прогресс задачи ${newTask.id} изменился:`, {
            old: oldTask.progress,
            new: newTask.progress,
            status: newTask.status
          });
        }
      });

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

  const handleAddTask = async (
    title: string,
    file: File | null,
    checkType: string,
    dataSource: string,
    productCodes?: string[],
    useAiKnowledge?: boolean
  ) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('checkType', checkType);
      formData.append('useKnowledge', useAiKnowledge ? 'use' : 'no');
      formData.append('userCompany', userData.company || '');
      formData.append('userEmail', userData.email || '');
      formData.append('userName', userData.name || '');
      
      if (dataSource === 'excel' && file) {
        formData.append('file', file);
      } else if (dataSource === 'mvideo' && productCodes) {
        formData.append('eans', productCodes.join(','));
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка при создании задачи');
      }

      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      addToast({
        id: Date.now().toString(),
        message: "Новая задача успешно добавлена",
        title: "Задача создана",
        description: "Задача была успешно создана и добавлена в список"
      });
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('Необходима авторизация');
      return;
    }

    try {
      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/tasks/${taskToDelete}`, {
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
    } finally {
      setTaskToDelete(null);
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
      const response = await fetch(`${API_URL}/files/${filename}`, {
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
        return 'Ожидает обработки';
      case 'PROCESSING':
        return 'В обработке';
      case 'COMPLETED':
        return 'Завершена';
      case 'FAILED':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const getCheckTypeText = (checkType: string | null) => {
    switch (checkType) {
      case null:
        return 'Без проверки';
      case 'none':
        return 'Без проверки';
      case 'selective':
        return 'Выборочная проверка';
      default:
        return checkType;
    }
  };

  const getDataSourceText = (task: Task) => {
    if (task.eans && task.eans.length > 0) {
      return 'М.Видео';
    }
    if (task.inputFiles && task.inputFiles.length > 0) {
      return 'Excel-файл';
    }
    return 'Не указан';
  };

  const toggleResults = (taskId: string) => {
    console.log('Toggle results for task:', taskId);
    console.log('Current expandedResults:', expandedResults);
    setExpandedResults(prev => {
      const newState = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      console.log('New expandedResults:', newState);
      return newState;
    });
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Некорректная дата';
      }
      return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Ошибка форматирования даты';
    }
  };

  const formatFileName = (fileName: string) => {

    return fileName
    // Удаляем расширение файла и timestamp
    // const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '').replace(/_\d+$/, '');
    
    // // Преобразуем названия по шаблонам
    // if (nameWithoutExtension.startsWith('pattern_')) {
    //   // const number = nameWithoutExtension.split('_')[1];
    //   return `Заполненный шаблон`;
    // } else if (nameWithoutExtension.startsWith('check_')) {
    //   const number = nameWithoutExtension.split('_')[1];
    //   return `Проверка заполнения шаблона №${number}`;
    // }
    
    // return nameWithoutExtension;
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-6">

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
          <AddTaskModal onAddTask={handleAddTask} />
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
                        {formatDate(task.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{getStatusText(task.status)}</span>
                  </div>

                  {task.error && (
                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                      {task.error}
                    </div>
                  )}

                  {task.status === 'PROCESSING' && (
                    <div className="space-y-1">
                      <Progress 
                        value={task.progress} 
                        className="h-2 bg-blue-100"
                      />
                      <p className="text-sm text-gray-500">
                        Прогресс: {task.progress}%
                      </p>
                    </div>
                  )}

                  {task.outputFiles?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Результаты ({task.outputFiles.length} {task.outputFiles.length === 1 ? 'файл' : 'файлов'}):
                        </p>
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
                      </div>
                      <div className={`transition-all duration-200 ${expandedResults[task.id] ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-2 gap-4">
                          {task.outputFiles.map((file, index) => {
                            const formattedName = formatFileName(file);
                            // Определяем, к какому столбцу относится файл
                            const isPattern = file.startsWith('pattern_');
                            const isCheck = file.startsWith('check_');
                            
                            return (
                              <div
                                key={index}
                                className={`flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer ${
                                  isPattern ? 'col-start-1' : isCheck ? 'col-start-2' : ''
                                }`}
                                onClick={() => handleDownloadFile(file)}
                              >
                                <Download className="h-4 w-4" />
                                <span>{formattedName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>Проверка:</span>
                      <span>
                        {getCheckTypeText(task.checkType)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Источник данных:</span>
                      <span>
                        {getDataSourceText(task)}
                      </span>
                    </div>
                  </div>

                  {task.status === 'COMPLETED' && task.result && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(task.result, '_blank')}
                      >
                        Скачать результат
                      </Button>
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

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление задачи"
        description="Вы уверены, что хотите удалить эту задачу?"
      />
    </div>
  );
} 