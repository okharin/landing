import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, BarChart2, Users, CheckSquare, FileText } from "lucide-react";
import { UserManagement } from '@/components/UserManagement';
import { TaskList } from '@/components/TaskList';
import Analytics from '@/components/Analytics';
import { TemplateManagement } from '@/components/TemplateManagement';
import { API_URL } from '@/config/api';

interface UserData {
  id: number;
  email: string;
  name: string;
  company: string | null;
  role: 'USER' | 'ADMIN';
  ai_request_limit: number;
  ai_request_used: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/');
        return;
      }
      const { id } = JSON.parse(userData);
      
      const response = await fetch(`${API_URL}/user/${id}`, {
        headers: {
          'user-id': id.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных пользователя');
      }

      const updatedUserData = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (err) {
      console.error('Ошибка при обновлении данных пользователя:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchUserData();
    }
  }, [activeTab]);

  const handleLogout = () => {
    const returnPath = localStorage.getItem('returnPath') || '/';
    localStorage.removeItem('user');
    localStorage.removeItem('returnPath');
    navigate(returnPath);
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return isAdmin ? <UserManagement /> : null;
      case 'templates':
        return isAdmin ? <TemplateManagement /> : null;
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold font-montserrat mb-6">
              Мои задачи
            </h2>
            <TaskList />
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold font-montserrat mb-6">
              Профиль пользователя
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Информация о пользователе */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Информация о пользователе</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Имя</label>
                  <p className="mt-1 text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Компания</label>
                  <p className="mt-1 text-lg">{user.company || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Роль</label>
                  <p className="mt-1 text-lg">{user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</p>
                </div>
              </div>

              {/* Лимит запросов к ИИ */}
              {user.role === 'USER' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Лимит запросов к ИИ</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">
                          {user.ai_request_used} / {user.ai_request_limit}
                        </p>
                        <div className="w-48 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-duomind-purple h-2.5 rounded-full" 
                            style={{ width: `${(user.ai_request_used / user.ai_request_limit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {user.ai_request_limit - user.ai_request_used} запросов осталось
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'overview':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold font-montserrat mb-6">
              Обзор
            </h2>
            <Analytics />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold font-montserrat gradient-text">
            DuoMind
          </a>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user.name}</span>
            <Button
              variant="outline"
              className="text-gray-700 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'overview' ? 'bg-gray-50 text-duomind-purple' : ''
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Обзор</span>
                </button>
                {!isAdmin && (
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                      activeTab === 'tasks' ? 'bg-gray-50 text-duomind-purple' : ''
                    }`}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span>Задачи</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                      activeTab === 'templates' ? 'bg-gray-50 text-duomind-purple' : ''
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Шаблоны</span>
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                      activeTab === 'users' ? 'bg-gray-50 text-duomind-purple' : ''
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Пользователи</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'profile' ? 'bg-gray-50 text-duomind-purple' : ''
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Профиль</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main content area */}
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 