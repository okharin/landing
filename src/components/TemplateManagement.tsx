import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Search, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from '@/config/api';

interface Template {
  id: number;
  name: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateDetail {
  name: string;
  prompt: string;
  json_schema: string;
}

interface Fewshot {
  id: number;
  user_text: string;
  assistant_response: string;
  template_id: number;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  template_file: File | null;
}

export const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [fewshotsModalOpen, setFewshotsModalOpen] = useState(false);
  const [currentFewshots, setCurrentFewshots] = useState<Fewshot[]>([]);
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('');
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
  const [editingFewshot, setEditingFewshot] = useState<Fewshot | null>(null);
  const [editingFewshotData, setEditingFewshotData] = useState<{user_text: string, assistant_response: string}>({
    user_text: '',
    assistant_response: ''
  });
  const [isAddingFewshot, setIsAddingFewshot] = useState(false);
  const [newFewshotData, setNewFewshotData] = useState<{user_text: string, assistant_response: string}>({
    user_text: '',
    assistant_response: ''
  });
  const [deletingFewshot, setDeletingFewshot] = useState<Fewshot | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    template_file: null
  });
  
  const [editFormData, setEditFormData] = useState<{
    name: string;
    prompt: string;
    json_schema: string;
  }>({
    name: '',
    prompt: '',
    json_schema: ''
  });
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [templatesPerPage] = useState(10);
  
  // Поиск
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTemplates = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/all`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      if (!response.ok) throw new Error('Ошибка при загрузке шаблонов');
      const data = await response.json();
      setTemplates(data);
      // Сбрасываем на первую страницу при загрузке новых данных
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'user-id': id.toString(),
        },
      });

      if (!response.ok) throw new Error('Ошибка при удалении шаблона');
      
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      setTemplates(updatedTemplates);
      setDeletingTemplate(null);
      
      // Если текущая страница стала пустой, переходим на предыдущую
      const newTotalPages = Math.ceil(updatedTemplates.length / templatesPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template_file) {
      setError('Пожалуйста, выберите файл шаблона');
      return;
    }
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      
      // Создаем FormData для отправки файла
      const formDataToSend = new FormData();
      formDataToSend.append('template_file', formData.template_file);
      
      const response = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: {
          'user-id': id.toString(),
          // Не устанавливаем Content-Type, браузер сам установит с boundary для FormData
        },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Ошибка при добавлении шаблона');
      
      const newTemplate = await response.json();
      setTemplates([...templates, newTemplate]);
      setIsAddModalOpen(false);
      setFormData({ template_file: null });
      // Сбрасываем на первую страницу при добавлении
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении шаблона');
      
      const updatedTemplate = await response.json();
      setTemplates(templates.map(template => 
        template.id === editingTemplate.id ? updatedTemplate : template
      ));
      setEditingTemplate(null);
      setEditFormData({ name: '', prompt: '', json_schema: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      template_file: file
    }));
  };

  const openEditModal = async (template: Template) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${template.id}`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      
      if (!response.ok) throw new Error('Ошибка при загрузке данных шаблона');
      
      const templateDetail: TemplateDetail = await response.json();
      setEditingTemplate(template);
      setEditFormData({
        name: templateDetail.name || '',
        prompt: templateDetail.prompt || '',
        json_schema: typeof templateDetail.json_schema === 'object' 
          ? JSON.stringify(templateDetail.json_schema, null, 2) 
          : (templateDetail.json_schema || '')
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных шаблона');
    }
  };





  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Загрузка примеров заполнения шаблона
  const handleShowFewshots = async (templateId: number, templateName: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${templateId}/fewshots`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      
      if (!response.ok) throw new Error('Ошибка при загрузке примеров заполнения');
      
      const responseData = await response.json();
      
      // Проверяем, что получили массив
      if (Array.isArray(responseData)) {
        setCurrentFewshots(responseData);
      } else if (responseData && responseData.fewshots && Array.isArray(responseData.fewshots)) {
        // Если данные обернуты в объект с полем fewshots
        setCurrentFewshots(responseData.fewshots);
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        // Если данные обернуты в объект с полем data
        setCurrentFewshots(responseData.data);
      } else {
        // Если структура неизвестна, устанавливаем пустой массив
        console.warn('Неожиданная структура ответа API:', responseData);
        setCurrentFewshots([]);
      }
      
      setCurrentTemplateName(templateName);
      setCurrentTemplateId(templateId);
      setFewshotsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке примеров');
    }
  };

  // Редактирование примера заполнения
  const handleEditFewshot = (fewshot: Fewshot) => {
    setEditingFewshot(fewshot);
    setEditingFewshotData({
      user_text: fewshot.user_text,
      assistant_response: fewshot.assistant_response
    });
  };

  // Сохранение изменений примера
  const handleSaveFewshot = async () => {
    if (!editingFewshot) return;
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${editingFewshot.template_id}/fewshots/${editingFewshot.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify({
          user_text: editingFewshotData.user_text,
          assistant_response: editingFewshotData.assistant_response,
          template_id: editingFewshot.template_id
        }),
      });
      
      if (!response.ok) throw new Error('Ошибка при обновлении примера');
      
      // Обновляем данные в локальном состоянии
      const updatedFewshot = await response.json();
      setCurrentFewshots(prev => 
        prev.map(fs => fs.id === editingFewshot.id ? updatedFewshot : fs)
      );
      
      // Закрываем режим редактирования
      setEditingFewshot(null);
      setEditingFewshotData({ user_text: '', assistant_response: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении примера');
    }
  };

  // Отмена редактирования примера
  const handleCancelEditFewshot = () => {
    setEditingFewshot(null);
    setEditingFewshotData({ user_text: '', assistant_response: '' });
  };

  // Добавление нового примера
  const handleAddFewshot = async () => {
    if (!newFewshotData.user_text.trim() || !newFewshotData.assistant_response.trim()) {
      setError('Пожалуйста, заполните оба поля');
      return;
    }
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      
      if (!currentTemplateId) {
        throw new Error('Не удалось определить ID шаблона');
      }
      
      const templateId = currentTemplateId;
      
      const response = await fetch(`${API_URL}/templates/${templateId}/fewshots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify({
          user_text: newFewshotData.user_text,
          assistant_response: newFewshotData.assistant_response
        }),
      });
      
      if (!response.ok) throw new Error('Ошибка при добавлении примера');
      
      const newFewshot = await response.json();
      
      // Добавляем новый пример в список
      setCurrentFewshots(prev => [...prev, newFewshot]);
      
      // Сбрасываем форму и закрываем режим добавления
      setNewFewshotData({ user_text: '', assistant_response: '' });
      setIsAddingFewshot(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при добавлении примера');
    }
  };

  // Отмена добавления примера
  const handleCancelAddFewshot = () => {
    setIsAddingFewshot(false);
    setNewFewshotData({ user_text: '', assistant_response: '' });
  };

  // Удаление примера заполнения
  const handleDeleteFewshot = async () => {
    if (!deletingFewshot) return;
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${deletingFewshot.template_id}/fewshots/${deletingFewshot.id}`, {
        method: 'DELETE',
        headers: {
          'user-id': id.toString(),
        },
      });
      
      if (!response.ok) throw new Error('Ошибка при удалении примера');
      
      // Удаляем пример из локального состояния
      setCurrentFewshots(prev => 
        prev.filter(fs => fs.id !== deletingFewshot.id)
      );
      
      // Закрываем модальное окно подтверждения
      setDeletingFewshot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при удалении примера');
    }
  };

  // Скачивание файла шаблона
  const handleDownloadTemplate = async (templateId: number, templateName: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/templates/${templateId}/download`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      
      if (!response.ok) throw new Error('Ошибка при скачивании файла шаблона');
      
      // Получаем blob из ответа
      const blob = await response.blob();
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Определяем имя файла из заголовка или используем название шаблона
      const contentDisposition = response.headers.get('content-disposition');
      let filename = templateName;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Очищаем ресурсы
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при скачивании файла');
    }
  };

  // Фильтрация и поиск
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.version.toString().includes(searchQuery);
    
    return matchesSearch;
  });

  // Обновляем пагинацию для отфильтрованных данных
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = filteredTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);

  // Сброс страницы при изменении поиска
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-montserrat">
          Управление шаблонами
        </h2>
        <Button
          onClick={() => {
            setFormData({
              template_file: null
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить шаблон
        </Button>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
          Поиск
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
              id="search"
              placeholder="Поиск по названию или версии..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
        </div>
      </div>

      {/* Информация о результатах поиска */}
      {searchQuery ? (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Результаты поиска:</span> найдено {filteredTemplates.length} шаблонов
            {searchQuery && (
              <span> по запросу "{searchQuery}"</span>
            )}
            {searchQuery ? (
              <span> из {templates.length} всего</span>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
            }}
            className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Сбросить поиск
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Версия</th>
              <th className="text-left py-3 px-4">Статус</th>
              <th className="text-left py-3 px-4">Дата создания</th>
              <th className="text-left py-3 px-4">Дата обновления</th>
              <th className="text-left py-3 px-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentTemplates.map(template => (
              <tr key={template.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{template.name}</td>
                <td className="py-3 px-4">{template.version}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    template.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {template.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="py-3 px-4">{template.created_at ? new Date(template.created_at).toLocaleDateString('ru-RU') : '-'}</td>
                <td className="py-3 px-4">{template.updated_at ? new Date(template.updated_at).toLocaleDateString('ru-RU') : '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(template)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleShowFewshots(template.id, template.name)}
                      title="Примеры заполнения шаблона"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleDownloadTemplate(template.id, template.name)}
                      title="Скачать файл шаблона"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeletingTemplate(template)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Показано {indexOfFirstTemplate + 1}-{Math.min(indexOfLastTemplate, filteredTemplates.length)} из {filteredTemplates.length} шаблонов
            {filteredTemplates.length !== templates.length && (
              <span className="text-gray-500"> (из {templates.length} всего)</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1"
            >
              Назад
            </Button>
            
            {/* Номера страниц */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Показываем максимум 5 страниц с многоточием
                if (totalPages <= 5) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="px-3 py-1 min-w-[40px]"
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                
                // Для большого количества страниц показываем с многоточием
                if (pageNumber === 1 || pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="px-3 py-1 min-w-[40px]"
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                
                // Показываем многоточие
                if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return (
                    <span key={pageNumber} className="px-2 py-1 text-gray-500">
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1"
            >
              Вперед
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно добавления шаблона */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Добавить шаблон</h3>
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div>
                <Label htmlFor="template_file">Файл шаблона</Label>
                <Input
                  id="template_file"
                  name="template_file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xlsm,.xls,.csv,.txt,.json"
                  className="w-full"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Поддерживаемые форматы: Excel (.xlsx, .xlsm, .xls), CSV, TXT, JSON
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования шаблона */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Редактировать шаблон</h3>
            <form onSubmit={handleEditTemplate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-prompt">Prompt</Label>
                <textarea
                  id="edit-prompt"
                  name="prompt"
                  value={editFormData.prompt}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent font-mono"
                  rows={8}
                  placeholder="Введите prompt для шаблона..."
                />
              </div>
              <div>
                <Label htmlFor="edit-json_schema">JSON Schema</Label>
                <textarea
                  id="edit-json_schema"
                  name="json_schema"
                  value={editFormData.json_schema}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, json_schema: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent font-mono"
                  rows={12}
                  placeholder="Введите JSON schema для шаблона..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingTemplate(null);
                    setEditFormData({ name: '', prompt: '', json_schema: '' });
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно с примерами заполнения */}
      {fewshotsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Примеры заполнения шаблона "{currentTemplateName}"</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingFewshot(true)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить пример
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFewshotsModalOpen(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
            
            {/* Форма добавления нового примера */}
            {isAddingFewshot && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50 mb-6">
                <h4 className="font-medium text-green-900 mb-4">Добавить новый пример</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-user-text" className="text-sm font-medium text-green-800 mb-2 block">
                      Ввод пользователя
                    </Label>
                    <textarea
                      id="new-user-text"
                      value={newFewshotData.user_text}
                      onChange={(e) => setNewFewshotData(prev => ({ ...prev, user_text: e.target.value }))}
                      className="w-full bg-white border border-green-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={4}
                      placeholder="Введите текст пользователя..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-assistant-response" className="text-sm font-medium text-green-800 mb-2 block">
                      Ответ ассистента
                    </Label>
                    <textarea
                      id="new-assistant-response"
                      value={newFewshotData.assistant_response}
                      onChange={(e) => setNewFewshotData(prev => ({ ...prev, assistant_response: e.target.value }))}
                      className="w-full bg-white border border-green-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={4}
                      placeholder="Введите ответ ассистента..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAddFewshot}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Отмена
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddFewshot}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            )}

            {!Array.isArray(currentFewshots) || currentFewshots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Примеры заполнения для этого шаблона не найдены
              </div>
            ) : (
              <div className="space-y-4">
                {currentFewshots.map((fewshot) => (
                  <div key={fewshot.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {editingFewshot?.id === fewshot.id ? (
                      // Режим редактирования
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Ввод пользователя:</h4>
                            <textarea
                              value={editingFewshotData.user_text}
                              onChange={(e) => setEditingFewshotData(prev => ({ ...prev, user_text: e.target.value }))}
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                              rows={4}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Ответ ассистента:</h4>
                            <textarea
                              value={editingFewshotData.assistant_response}
                              onChange={(e) => setEditingFewshotData(prev => ({ ...prev, assistant_response: e.target.value }))}
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                              rows={4}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditFewshot}
                          >
                            Отмена
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveFewshot}
                          >
                            Сохранить
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Режим просмотра
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Ввод пользователя:</h4>
                            <div className="bg-white border border-gray-200 rounded-md p-3 text-sm">
                              {fewshot.user_text}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Ответ ассистента:</h4>
                            <div className="bg-white border border-gray-200 rounded-md p-3 text-sm">
                              {fewshot.assistant_response}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Создан: {new Date(fewshot.created_at).toLocaleDateString('ru-RU')} | 
                            Обновлен: {new Date(fewshot.updated_at).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFewshot(fewshot)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Редактировать
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingFewshot(fewshot)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления примера */}
      {deletingFewshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Подтверждение удаления</h3>
            <p className="mb-6">
              Вы уверены, что хотите удалить пример заполнения?
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <div className="text-sm">
                <div className="font-medium mb-2">Ввод пользователя:</div>
                <div className="text-gray-600 mb-3">{deletingFewshot.user_text.substring(0, 100)}{deletingFewshot.user_text.length > 100 ? '...' : ''}</div>
                <div className="font-medium mb-2">Ответ ассистента:</div>
                <div className="text-gray-600">{deletingFewshot.assistant_response.substring(0, 100)}{deletingFewshot.assistant_response.length > 100 ? '...' : ''}</div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeletingFewshot(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteFewshot}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deletingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Подтверждение удаления</h3>
            <p className="mb-6">
              Вы уверены, что хотите удалить шаблон "{deletingTemplate.name}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeletingTemplate(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTemplate(deletingTemplate.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 