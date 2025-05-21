import * as React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddTaskModalProps {
  onAddTask: (title: string, file: File, checkType: string) => Promise<void>;
}

export function AddTaskModal({ onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkType, setCheckType] = useState('none');

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
    setError('');
    setIsSubmitting(true);

    if (!title.trim()) {
      setError('Введите название задачи');
      setIsSubmitting(false);
      return;
    }
    if (!selectedFile) {
      setError('Выберите файл Excel');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddTask(title, selectedFile, checkType);
      setTitle('');
      setSelectedFile(null);
      setError('');
      setCheckType('none');
      setIsOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('уже существует')) {
          setError('Задача с таким названием уже существует');
        } else if (err.message.includes('формат')) {
          setError('Неподдерживаемый формат файла. Пожалуйста, используйте Excel (.xlsx)');
        } else if (err.message.includes('размер')) {
          setError('Размер файла превышает допустимый предел (100 МБ)');
        } else if (err.message.includes('авторизация')) {
          setError('Необходима авторизация. Пожалуйста, войдите в систему');
        } else {
          setError(err.message || 'Произошла ошибка при создании задачи');
        }
      } else {
        setError('Произошла неизвестная ошибка при создании задачи');
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить задачу
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            <Label htmlFor="file">Файл Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkType">Проверка результата</Label>
            <Select
              value={checkType}
              onValueChange={setCheckType}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип проверки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без проверки</SelectItem>
                <SelectItem value="selective">Выборочная проверка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md">
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