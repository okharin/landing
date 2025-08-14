import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


import { Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { Switch } from "./ui/switch";



interface AddTaskModalProps {
  onAddTask: (title: string, file: File | null, checkType: string, dataSource: string, productCodes?: string[], useAiKnowledge?: boolean, templateId?: number, customTemplateFile?: File | null, enableTemplateFiltering?: boolean) => Promise<void>;
}

export function AddTaskModal({ onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkType, setCheckType] = useState('none');

  const [useAiKnowledge, setUseAiKnowledge] = useState(true);
  const [templates, setTemplates] = useState<Array<{id: number, name: string}>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | undefined>(undefined);
  const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null);
  const [showCustomTemplate, setShowCustomTemplate] = useState(false);
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<Array<{id: number, name: string}>>([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [enableTemplateFiltering, setEnableTemplateFiltering] = useState(false);
  const [checkTypePopoverOpen, setCheckTypePopoverOpen] = useState(false);

    useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setFilteredTemplates(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке шаблонов:', error);
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // Закрытие выпадающих списков при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatePopoverOpen) {
        const target = event.target as Element;
        if (!target.closest('.template-dropdown')) {
          setTemplatePopoverOpen(false);
        }
      }
      if (checkTypePopoverOpen) {
        const target = event.target as Element;
        if (!target.closest('.check-type-dropdown')) {
          setCheckTypePopoverOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [templatePopoverOpen, checkTypePopoverOpen]);





  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const maxSize = 10 * 1024 * 1024; // 10 МБ в байтах
        if (file.size > maxSize) {
          setError('Размер файла не должен превышать 10 МБ');
          setSelectedFile(null);
          return;
        }
        setSelectedFile(file);
        setError('');
      } else {
        setError('Пожалуйста, выберите файл Excel (.xlsx)');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Введите название задачи');
      return;
    }



    if (!selectedFile) {
              setError('Выберите файл для обработки');
      return;
    }

    if (!showCustomTemplate && !selectedTemplate) {
      setError('Выберите категорию товаров');
      return;
    }

    if (showCustomTemplate && !customTemplateFile) {
      setError('Выберите файл шаблона');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let templateId = selectedTemplate;
      
      // Если выбран "добавить свой файл шаблона", сначала создаем шаблон
      if (showCustomTemplate && customTemplateFile) {
        try {
          const userData = localStorage.getItem('user');
          if (!userData) throw new Error('Пользователь не авторизован');
          
          const { id } = JSON.parse(userData);
          
          // Создаем FormData для отправки файла шаблона
          const formData = new FormData();
          formData.append('template_file', customTemplateFile);
          
          const templateResponse = await fetch('/api/templates', {
            method: 'POST',
            headers: {
              'user-id': id.toString(),
            },
            body: formData,
          });
          
          if (!templateResponse.ok) {
            throw new Error('Ошибка при создании шаблона');
          }
          
          const newTemplate = await templateResponse.json();
          templateId = newTemplate.id;
        } catch (templateErr) {
          throw new Error(`Ошибка при создании шаблона: ${templateErr instanceof Error ? templateErr.message : 'Неизвестная ошибка'}`);
        }
      }
      
      // Теперь создаем задачу с полученным или выбранным templateId
      await onAddTask(title, selectedFile, checkType, 'excel', undefined, useAiKnowledge, templateId, undefined, enableTemplateFiltering);
      setTitle('');
      setSelectedFile(null);
      setCheckType('none');
      setUseAiKnowledge(true);
      setSelectedTemplate(undefined);
      setCustomTemplateFile(null);
      setShowCustomTemplate(false);
      setTemplatePopoverOpen(false);
      setFilteredTemplates(templates);
      setTemplateSearchQuery('');
      setIsOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка при создании задачи');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
    setSelectedFile(null);
    setError('');
    setCheckType('none');

    setUseAiKnowledge(true);
    setSelectedTemplate(undefined);
    setCustomTemplateFile(null);
    setShowCustomTemplate(false);
    setTemplatePopoverOpen(false);
    setFilteredTemplates(templates);
    setTemplateSearchQuery('');
    setEnableTemplateFiltering(false);
    setCheckTypePopoverOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить задачу
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название задачи</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи"
              disabled={isSubmitting}
            />
          </div>




          <div className="space-y-2">
            <Label htmlFor="file">Файл для обработки</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Категория товаров</Label>
            <div className="relative template-dropdown">
              <Button
                type="button"
                variant="outline"
                role="combobox"
                disabled={isSubmitting}
                className="w-full justify-between"
                onClick={(e) => {
                  e.preventDefault();
                  setTemplatePopoverOpen(!templatePopoverOpen);
                }}
              >
                {selectedTemplate
                  ? templates.find((template) => template.id === selectedTemplate)?.name
                  : "Выберите категорию..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {templatePopoverOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2">
                    <Input
                      placeholder="Поиск категорий..."
                      className="mb-2"
                      value={templateSearchQuery}
                      autoFocus
                      onChange={(e) => {
                        const query = e.target.value;
                        setTemplateSearchQuery(query);
                        const filtered = templates.filter(template =>
                          template.name.toLowerCase().includes(query.toLowerCase())
                        );
                        setFilteredTemplates(filtered);
                      }}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              setTemplatePopoverOpen(false);
                            }}
                          >
                            {template.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-gray-500">
                          Категории не найдены
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Шаблон</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="template-select"
                  name="template-type"
                  checked={!showCustomTemplate}
                  onChange={() => setShowCustomTemplate(false)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="template-select">Использовать существующий</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="template-custom"
                  name="template-type"
                  checked={showCustomTemplate}
                  onChange={() => setShowCustomTemplate(true)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="template-custom">Загрузить новый</Label>
              </div>
              
              {showCustomTemplate && (
                <Input
                  type="file"
                  accept=".xlsx,.xlsm,.xls,.csv,.txt,.json"
                  onChange={(e) => setCustomTemplateFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* Переключатель для обработки только товаров категории выбранного шаблона */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enableTemplateFiltering" className="flex-1">
              Обрабатывать только товары выбранной категории
            </Label>
            <Switch
              id="enableTemplateFiltering"
              checked={enableTemplateFiltering}
              onCheckedChange={setEnableTemplateFiltering}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="useAiKnowledge" className="flex-1">
              Использовать знания модели ИИ
            </Label>
            <Switch
              id="useAiKnowledge"
              checked={useAiKnowledge}
              onCheckedChange={setUseAiKnowledge}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkType">Проверка результата</Label>
            <div className="relative check-type-dropdown">
              <Button
                type="button"
                variant="outline"
                role="combobox"
                disabled={isSubmitting}
                className="w-full justify-between"
                onClick={(e) => {
                  e.preventDefault();
                  setCheckTypePopoverOpen(!checkTypePopoverOpen);
                }}
              >
                {checkType === 'none' ? 'Без проверки' : 'Выборочная проверка'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {checkTypePopoverOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="max-h-60 overflow-y-auto">
                    <div
                      className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setCheckType('none');
                        setCheckTypePopoverOpen(false);
                      }}
                    >
                      Без проверки
                    </div>
                    <div
                      className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setCheckType('selective');
                        setCheckTypePopoverOpen(false);
                      }}
                    >
                      Выборочная проверка
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-red-500 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 