'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Clock, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScheduleDialog } from '@/components/ui/schedule-dialog';
import { useAuthStore } from '@/lib/store';
import { getUserData, deleteSchedule, updateTodo } from '@/lib/storage';
import { Schedule, Todo } from '@/lib/types';
import 'react-calendar/dist/Calendar.css';

interface HomePageProps {
  searchParams: Promise<{ code?: string }>;
}

export default function HomePage({ searchParams }: HomePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [accessCode, setAccessCode] = useState<string>('');
  const [showTodos, setShowTodos] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { loadUserData, userData } = useAuthStore();

  useEffect(() => {
    const initializeData = async () => {
      const params = await searchParams;
      const code = params.code;
      
      if (code) {
        setAccessCode(code);
        loadUserData(code);
        const data = getUserData(code);
        if (data) {
          setSchedules(data.schedules);
          setTodos(data.todos);
          setCategories(data.categories);
        }
      }
    };

    initializeData();
  }, [searchParams, loadUserData]);

  const selectedDateSchedules = schedules.filter(schedule =>
    isSameDay(new Date(schedule.date), selectedDate)
  );

  const selectedDateTodos = todos.filter(todo =>
    todo.dueDate && isSameDay(new Date(todo.dueDate), selectedDate)
  );

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const daySchedules = schedules.filter(schedule =>
        isSameDay(new Date(schedule.date), date)
      );
      const dayTodos = todos.filter(todo =>
        todo.dueDate && isSameDay(new Date(todo.dueDate), date)
      );

      const hasEvents = daySchedules.length > 0 || dayTodos.length > 0;

      if (hasEvents) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const refreshData = () => {
    const data = getUserData(accessCode);
    if (data) {
      setSchedules(data.schedules);
      setTodos(data.todos);
      setCategories(data.categories);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleDialog(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      try {
        deleteSchedule(accessCode, scheduleId);
        refreshData();
      } catch (error) {
        console.error('일정 삭제 오류:', error);
        alert('일정 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleScheduleDialogClose = () => {
    setShowScheduleDialog(false);
    setEditingSchedule(null);
  };

  const handleToggleTodo = (todoId: string, completed: boolean) => {
    try {
      updateTodo(accessCode, todoId, { completed });
      refreshData();
    } catch (error) {
      console.error('할 일 상태 변경 오류:', error);
    }
  };

  if (!accessCode) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation accessCode={accessCode} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>캘린더</span>
                  <Button 
                    onClick={() => setShowScheduleDialog(true)}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    일정 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="react-calendar-container">
                  <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    locale="ko-KR"
                    tileContent={tileContent}
                    className="w-full border-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{format(selectedDate, 'M월 d일 (E)', { locale: ko })}</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowTodos(false)}
                      className={!showTodos ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}
                    >
                      일정
                    </Button>
                    <Button
                      onClick={() => setShowTodos(true)}
                      className={showTodos ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}
                    >
                      할 일
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showTodos ? (
                  // Schedules
                  selectedDateSchedules.length > 0 ? (
                    selectedDateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-slate-600"
                        style={{
                          backgroundColor: schedule.backgroundColor || '#f8fafc',
                          color: schedule.textColor || '#334155'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {schedule.emoji && (
                                <span className="text-lg">{schedule.emoji}</span>
                              )}
                              <h3 className="font-semibold">{schedule.title}</h3>
                            </div>
                            {(schedule.startTime || schedule.endTime) && (
                              <div className="flex items-center space-x-1 mt-1 text-sm opacity-75">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {schedule.startTime && schedule.endTime
                                    ? `${schedule.startTime} - ${schedule.endTime}`
                                    : schedule.startTime || schedule.endTime}
                                </span>
                              </div>
                            )}
                            {schedule.content && (
                              <p className="text-sm mt-1 opacity-75">{schedule.content}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {schedule.category}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => handleEditSchedule(schedule)}
                                className="p-1 h-6 w-6 bg-blue-500 hover:bg-blue-600"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-1 h-6 w-6 bg-red-500 hover:bg-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      선택한 날짜에 일정이 없습니다
                    </p>
                  )
                ) : (
                  // Todos
                  selectedDateTodos.length > 0 ? (
                    selectedDateTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-slate-600"
                        style={{
                          backgroundColor: todo.backgroundColor || '#f8fafc',
                          color: todo.textColor || '#334155'
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => handleToggleTodo(todo.id, e.target.checked)}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {todo.emoji && (
                                <span className="text-lg">{todo.emoji}</span>
                              )}
                              <h3 className={`font-semibold ${todo.completed ? 'line-through opacity-50' : ''}`}>
                                {todo.title}
                              </h3>
                            </div>
                            {todo.description && (
                              <p className="text-sm mt-1 opacity-75">{todo.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {todo.category}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      선택한 날짜에 할 일이 없습니다
                    </p>
                  )
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>오늘 일정</span>
                  <span className="font-semibold">{selectedDateSchedules.length}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>오늘 할 일</span>
                  <span className="font-semibold">
                    {selectedDateTodos.filter(todo => !todo.completed).length}개
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>완료된 할 일</span>
                  <span className="font-semibold">
                    {selectedDateTodos.filter(todo => todo.completed).length}개
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={showScheduleDialog}
        onClose={handleScheduleDialogClose}
        selectedDate={selectedDate}
        accessCode={accessCode}
        categories={categories}
        onScheduleAdded={refreshData}
        editingSchedule={editingSchedule}
      />

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          background: white;
          border: none;
          font-family: inherit;
          line-height: 1.125em;
        }
        .react-calendar--dark {
          background: #1e293b;
          color: white;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 16px;
          margin-top: 8px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f1f5f9;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          color: #64748b;
        }
        .react-calendar__tile {
          max-width: 100%;
          padding: 10px 6px;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 0.875em;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f1f5f9;
        }
        .react-calendar__tile--active {
          background: #6366f1 !important;
          color: white;
        }
        .react-calendar__tile--now {
          background: #fef3c7;
        }
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background: #fde68a;
        }
      `}</style>
    </div>
  );
} 