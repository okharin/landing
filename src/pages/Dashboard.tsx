import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, BarChart2, Users, CheckSquare } from "lucide-react";
import { UserManagement } from '@/components/UserManagement';
import { TaskList } from '@/components/TaskList';
import Analytics from '@/components/Analytics';

interface UserData {
  id: number;
  email: string;
  name: string;
  company: string | null;
  role: 'USER' | 'ADMIN';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

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
            <div className="space-y-4">
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
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold font-montserrat mb-6">
              Аналитика
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
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-2 text-gray-700 hover:text-duomind-purple p-2 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'profile' ? 'bg-gray-50 text-duomind-purple' : ''
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Профиль</span>
                </button>
                {!isAdmin && (
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md w-full text-left ${
                      activeTab === 'tasks' ? 'bg-gray-50 text-duomind-purple' : ''
                    }`}
                    onClick={() => setActiveTab('tasks')}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span>Задачи</span>
                  </button>
                )}
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md w-full text-left ${
                    activeTab === 'analytics' ? 'bg-gray-50 text-duomind-purple' : ''
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Аналитика</span>
                </button>
                {isAdmin && (
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md w-full text-left ${
                      activeTab === 'users' ? 'bg-gray-50 text-duomind-purple' : ''
                    }`}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="w-5 h-5" />
                    <span>Пользователи</span>
                  </button>
                )}
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