import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from '@/config/api';

interface Company {
  id: number;
  name: string;
  ai_request_limit: number;
  ai_request_used: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  company_id: number | null;
  company_name: string | null;
  role: 'USER' | 'ADMIN';
}

interface UserFormData {
  email: string;
  name: string;
  company_id: number;
  password: string;
  role: 'USER' | 'ADMIN';
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    company_id: 0,
    password: '',
    role: 'USER'
  });



  const fetchCompanies = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/companies`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      if (!response.ok) throw new Error('Ошибка при загрузке компаний');
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error('Ошибка при загрузке компаний:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'user-id': id.toString(),
        },
      });
      if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'user-id': id.toString(),
        },
      });

      if (!response.ok) throw new Error('Ошибка при удалении пользователя');
      
      setUsers(users.filter(user => user.id !== userId));
      setDeletingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Ошибка при добавлении пользователя');
      
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setIsAddModalOpen(false);
      setFormData({ email: '', name: '', company_id: 0, password: '', role: 'USER' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении пользователя');
      
      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      setFormData({ email: '', name: '', company_id: 0, password: '', role: 'USER' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'company_id' ? parseInt(value) || 0 : value
    }));
  };



  const openEditModal = (user: User) => {
    setEditingUser(user);
          setFormData({
        email: user.email,
        name: user.name,
        company_id: user.company_id || 0,
        password: '',
        role: user.role
      });
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-montserrat">
          Управление пользователями
        </h2>
        <Button
          onClick={() => {
            setFormData({
              email: '',
              name: '',
              company_id: 0,
              password: '',
              role: 'USER'
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить пользователя
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Имя</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Компания</th>
              <th className="text-left py-3 px-4">Роль</th>

              <th className="text-left py-3 px-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.company_name || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeletingUser(user)}
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

      {/* Модальное окно добавления пользователя */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Добавить пользователя</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Компания</Label>
                <select
                  id="company"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                >
                  <option value={0}>Выберите компанию</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border rounded px-2 py-1"
                >
                  <option value="USER">Пользователь</option>
                  <option value="ADMIN">Администратор</option>
                </select>
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

      {/* Модальное окно редактирования пользователя */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Редактировать пользователя</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Имя</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Компания</Label>
                <select
                  id="edit-company"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-duomind-purple focus:border-transparent"
                >
                  <option value={0}>Выберите компанию</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Роль</Label>
                <select
                  id="edit-role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border rounded px-2 py-1"
                >
                  <option value="USER">Пользователь</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Подтверждение удаления</h3>
            <p className="mb-6">
              Вы уверены, что хотите удалить пользователя {deletingUser.name}?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeletingUser(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(deletingUser.id)}
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