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
import { Plus } from 'lucide-react';

interface AddTaskModalProps {
  onAddTask: (title: string, file: File) => Promise<void>;
}

export function AddTaskModal({ onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const maxSize = 100 * 1024 * 1024; // 100 МБ в байтах
        if (file.size > maxSize) {
          setError('Размер файла не должен превышать 100 МБ');
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
      setError('Выберите файл Excel');
      return;
    }

    try {
      await onAddTask(title, selectedFile);
      setTitle('');
      setSelectedFile(null);
      setError('');
      setIsOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('уже существует')) {
          setError('Задача с таким названием уже существует');
        } else {
          setError(err.message || 'Ошибка при создании задачи');
        }
      } else {
        setError('Ошибка при создании задачи');
      }
    }
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Файл Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 