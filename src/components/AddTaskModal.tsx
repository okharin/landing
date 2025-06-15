import React, { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, AlertCircle, X } from 'lucide-react';
import { Switch } from "./ui/switch";

interface ProductCode {
  ean: string;
  name: string;
}

interface AddTaskModalProps {
  onAddTask: (title: string, file: File | null, checkType: string, dataSource: string, productCodes?: string[], useAiKnowledge?: boolean) => Promise<void>;
}

export function AddTaskModal({ onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkType, setCheckType] = useState('none');
  const [dataSource, setDataSource] = useState('mvideo');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [useAiKnowledge, setUseAiKnowledge] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        console.log('Начинаем загрузку списка товаров...');
        const response = await fetch('/api/eans');
        console.log('Статус ответа:', response.status);
        console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные от сервера:', data);
        
        if (!Array.isArray(data)) {
          console.error('Ошибка: данные не являются массивом:', data);
          setAllProducts([]);
          return;
        }
        const validProducts = data.filter((ean: any) => typeof ean === 'string');
        console.log('Количество валидных EAN:', validProducts.length);
        if (validProducts.length > 0) {
          console.log('Примеры EAN:', validProducts.slice(0, 3));
        }
        setAllProducts(validProducts);
      } catch (error) {
        console.error('Ошибка при загрузке списка товаров:', error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return [];
    return allProducts
      .filter((ean) => ean.includes(searchQuery))
      .slice(0, 5);
  }, [allProducts, searchQuery]);

  const handleRemoveProduct = (eanToRemove: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.ean !== eanToRemove));
  };

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

    if (dataSource === 'mvideo' && selectedProducts.length === 0) {
      setError('Выберите хотя бы один товар');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const productCodes = dataSource === 'mvideo' ? selectedProducts.map(p => p.ean) : undefined;
      await onAddTask(title, selectedFile, checkType, dataSource, productCodes, useAiKnowledge);
      setTitle('');
      setSelectedFile(null);
      setCheckType('none');
      setDataSource('mvideo');
      setSelectedProducts([]);
      setUseAiKnowledge(true);
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
    setDataSource('mvideo');
    setSelectedProducts([]);
    setSearchQuery('');
    setUseAiKnowledge(true);
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
            <Label htmlFor="dataSource">Источник данных</Label>
            <Select
              value={dataSource}
              onValueChange={setDataSource}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите источник данных" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mvideo">М.Видео</SelectItem>
                <SelectItem value="excel">Файл Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dataSource === 'mvideo' && (
            <div className="space-y-2">
              <Label htmlFor="products">Коды товаров</Label>
              <div ref={inputContainerRef} className="relative">
                <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-white min-h-[40px]">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.ean}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      <span>{product.ean}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.ean)}
                        className="text-gray-500 hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={selectedProducts.length === 0 ? "Введите код товара..." : ""}
                    className="flex-1 min-w-[100px] outline-none bg-transparent"
                    disabled={isSubmitting}
                  />
                </div>
                {!isLoading && showSuggestions && searchQuery.trim() && filteredProducts.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {filteredProducts.map((ean) => (
                      <div
                        key={ean}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (!selectedProducts.find(p => p.ean === ean)) {
                            setSelectedProducts([...selectedProducts, { ean, name: ean }]);
                          }
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="text-sm">{ean}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {dataSource === 'excel' && (
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
          )}

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