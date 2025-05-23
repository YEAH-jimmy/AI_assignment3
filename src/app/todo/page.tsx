'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Filter, Trash2, Edit3 } from 'lucide-react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/lib/store';
import { getUserData, addTodo, updateTodo, deleteTodo } from '@/lib/storage';
import { Todo } from '@/lib/types';

interface TodoPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default function TodoPage({ searchParams }: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [accessCode, setAccessCode] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const { loadUserData, refreshUserData } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    backgroundColor: '#f8fafc',
    textColor: '#334155'
  });

  useEffect(() => {
    const initializeData = async () => {
      const params = await searchParams;
      const code = params.code;
      
      if (code) {
        setAccessCode(code);
        loadUserData(code);
        const data = getUserData(code);
        if (data) {
          setTodos(data.todos);
          setCategories(data.categories);
          // 카테고리가 없으면 기본값 설정
          if (data.categories.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: data.categories[0] }));
          }
        }
      }
    };

    initializeData();
  }, [searchParams, loadUserData]);

  const filteredTodos = todos.filter(todo => {
    const categoryMatch = filterCategory === 'all' || todo.category === filterCategory;
    const statusMatch = 
      filterStatus === 'all' || 
      (filterStatus === 'completed' && todo.completed) ||
      (filterStatus === 'pending' && !todo.completed);
    
    return categoryMatch && statusMatch;
  });

  const handleSubmit = () => {
    // 에러 초기화
    setError('');
    
    // 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.category && categories.length === 0) {
      setError('카테고리가 설정되지 않았습니다.');
      return;
    }

    const todoData: Todo = {
      id: editingTodo?.id || `todo_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      category: formData.category || categories[0] || '기타',
      completed: editingTodo?.completed || false,
      emoji: '',
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      createdAt: editingTodo?.createdAt || new Date().toISOString()
    };

    try {
      if (editingTodo) {
        updateTodo(accessCode, editingTodo.id, todoData);
      } else {
        addTodo(accessCode, todoData);
      }

      refreshData();
      resetForm();
    } catch (error) {
      console.error('할 일 저장 오류:', error);
      setError('할 일 저장 중 오류가 발생했습니다.');
    }
  };

  const handleToggleComplete = (todoId: string, completed: boolean) => {
    try {
      updateTodo(accessCode, todoId, { completed });
      refreshData();
    } catch (error) {
      console.error('할 일 상태 변경 오류:', error);
    }
  };

  const handleDelete = (todoId: string) => {
    try {
      deleteTodo(accessCode, todoId);
      refreshData();
    } catch (error) {
      console.error('할 일 삭제 오류:', error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate || '',
      category: todo.category,
      backgroundColor: todo.backgroundColor || '#f8fafc',
      textColor: todo.textColor || '#334155'
    });
    setShowForm(true);
    setError('');
  };

  const refreshData = () => {
    const data = getUserData(accessCode);
    if (data) {
      setTodos(data.todos);
      setCategories(data.categories);
    }
    refreshUserData();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      category: categories.length > 0 ? categories[0] : '',
      backgroundColor: '#f8fafc',
      textColor: '#334155'
    });
    setEditingTodo(null);
    setShowForm(false);
    setError('');
  };

  if (!accessCode) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation accessCode={accessCode} />
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">할 일 관리</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {todos.length}개의 할 일 • {todos.filter(t => t.completed).length}개 완료
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowForm(true);
              setError('');
              if (categories.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: categories[0] }));
              }
            }}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            할 일 추가
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingTodo ? '할 일 수정' : '새 할 일 추가'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">제목 *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="할 일 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리 *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="할 일에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">마감일</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">배경색</label>
                  <Input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleSubmit} 
                  className="bg-indigo-500 hover:bg-indigo-600"
                  disabled={!formData.title.trim()}
                >
                  {editingTodo ? '수정' : '추가'}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className="transition-all hover:shadow-md"
                style={{
                  backgroundColor: todo.backgroundColor || '#ffffff',
                  borderColor: todo.completed ? '#10b981' : '#e5e7eb'
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) => 
                        handleToggleComplete(todo.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 
                          className={`font-semibold ${todo.completed ? 'line-through opacity-60' : ''}`}
                          style={{ color: todo.textColor || '#1f2937' }}
                        >
                          {todo.title}
                        </h3>
                      </div>
                      
                      {todo.description && (
                        <p 
                          className={`text-sm mb-2 ${todo.completed ? 'opacity-60' : 'opacity-75'}`}
                          style={{ color: todo.textColor || '#1f2937' }}
                        >
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {todo.category}
                        </Badge>
                        {todo.dueDate && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              {format(new Date(todo.dueDate), 'M월 d일', { locale: ko })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        onClick={() => handleEdit(todo)}
                        className="p-2 h-8 w-8 bg-blue-500 hover:bg-blue-600"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(todo.id)}
                        className="p-2 h-8 w-8 bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">할 일이 없습니다.</p>
                <Button 
                  onClick={() => {
                    setShowForm(true);
                    setError('');
                    if (categories.length > 0) {
                      setFormData(prev => ({ ...prev, category: categories[0] }));
                    }
                  }}
                  className="mt-4 bg-indigo-500 hover:bg-indigo-600"
                >
                  첫 번째 할 일 추가하기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 