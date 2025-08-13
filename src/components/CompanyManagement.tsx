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

interface CompanyFormData {
  name: string;
  ai_request_limit: number;
}

export const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    ai_request_limit: 0
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
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDeleteCompany = async (companyId: number) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'user-id': id.toString(),
        },
      });

      if (!response.ok) throw new Error('Ошибка при удалении компании');
      
      setCompanies(companies.filter(company => company.id !== companyId));
      setDeletingCompany(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Ошибка при добавлении компании');
      
      const newCompany = await response.json();
      setCompanies([...companies, newCompany]);
      setIsAddModalOpen(false);
      setFormData({ name: '', ai_request_limit: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Пользователь не авторизован');

      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id.toString(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении компании');
      
      const updatedCompany = await response.json();
      setCompanies(companies.map(company => 
        company.id === editingCompany.id ? updatedCompany : company
      ));
      setEditingCompany(null);
      setFormData({ name: '', ai_request_limit: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ai_request_limit' ? parseInt(value) || 0 : value
    }));
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      ai_request_limit: company.ai_request_limit
    });
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingCompany(null);
    setFormData({ name: '', ai_request_limit: 0 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Загрузка компаний...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-red-600 mb-4">Ошибка: {error}</div>
        <Button onClick={fetchCompanies}>Повторить</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-montserrat">Управление компаниями</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Добавить компанию
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Лимит запросов к ИИ</th>
              <th className="text-left py-3 px-4">Использовано запросов</th>
              <th className="text-left py-3 px-4">Дата создания</th>
              <th className="text-left py-3 px-4">Дата обновления</th>
              <th className="text-left py-3 px-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{company.name}</td>
                <td className="py-3 px-4">{company.ai_request_limit}</td>
                <td className="py-3 px-4">{company.ai_request_used}</td>
                <td className="py-3 px-4">{formatDate(company.created_at)}</td>
                <td className="py-3 px-4">{formatDate(company.updated_at)}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(company)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeletingCompany(company)}
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

      {/* Модальное окно добавления компании */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Добавить компанию</h3>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <Label htmlFor="name">Название компании</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ai_request_limit">Лимит запросов к ИИ</Label>
                <Input
                  id="ai_request_limit"
                  name="ai_request_limit"
                  type="number"
                  value={formData.ai_request_limit}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Добавить
                </Button>
                <Button type="button" variant="outline" onClick={closeModals} className="flex-1">
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования компании */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Редактировать компанию</h3>
            <form onSubmit={handleEditCompany} className="space-y-4">
              <div>
                <Label htmlFor="name">Название компании</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ai_request_limit">Лимит запросов к ИИ</Label>
                <Input
                  id="ai_request_limit"
                  name="ai_request_limit"
                  type="number"
                  value={formData.ai_request_limit}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Сохранить
                </Button>
                <Button type="button" variant="outline" onClick={closeModals} className="flex-1">
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deletingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Подтверждение удаления</h3>
            <p className="mb-6">
              Вы уверены, что хотите удалить компанию "{deletingCompany.name}"?
              Это действие нельзя отменить.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleDeleteCompany(deletingCompany.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Удалить
              </Button>
              <Button variant="outline" onClick={() => setDeletingCompany(null)}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
