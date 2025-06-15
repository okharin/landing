import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import svyazonLogo from '../resources/svyazon-logo-full-dark.svg';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [chatbotTop, setChatbotTop] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Сохраняем текущий путь перед логином
    localStorage.setItem('returnPath', location.pathname);
  }, [location]);

  useEffect(() => {
    if (showChatbot && logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setChatbotTop(rect.bottom + window.scrollY + 8); // 8px отступ
    }
  }, [showChatbot]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="p-6 flex justify-between items-center relative">
        <a href="/" className="text-5xl font-bold font-montserrat gradient-text">
          DuoMind
        </a>
        <div className="relative">
          <img 
            ref={logoRef}
            src={svyazonLogo} 
            alt="Связь.ON" 
            className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowChatbot(!showChatbot)}
          />
          {showChatbot && (
            <div
              className="fixed right-4 w-[400px] bg-white rounded-lg shadow-lg z-50"
              style={{
                top: chatbotTop,
                height: `calc(100vh - ${chatbotTop}px - 16px)`, // растягивается до низа
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <iframe
                src="https://platform.duomind.ru/chatbot/MfvHCAS50hoHQBN1"
                className="w-full h-full border-0 rounded-lg flex-1"
                title="Чат-бот Связь.ON"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Введите свои учетные данные для входа
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-duomind-purple hover:bg-duomind-purple/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 