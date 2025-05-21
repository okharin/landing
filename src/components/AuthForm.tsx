import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';

interface AuthFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthForm = ({ isOpen, onClose }: AuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущий путь перед открытием формы логина
      const currentPath = location.pathname;
      localStorage.setItem('returnPath', currentPath);
    }
  }, [isOpen, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const user = await userService.login(formData);
      
      // Сохраняем информацию о пользователе
      console.log('Полученные данные пользователя:', user);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Сохраненные данные в localStorage:', localStorage.getItem('user'));
      
      onClose();
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка при авторизации');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold font-montserrat mb-6">
            Вход в личный кабинет
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-duomind-purple hover:bg-duomind-purple/90 text-white font-medium py-3 rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 