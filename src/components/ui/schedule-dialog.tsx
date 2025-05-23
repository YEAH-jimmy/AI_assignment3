'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Schedule } from '@/lib/types';
import { addSchedule } from '@/lib/storage';

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  accessCode: string;
  categories: string[];
  onScheduleAdded: () => void;
}

export function ScheduleDialog({ 
  isOpen, 
  onClose, 
  selectedDate, 
  accessCode, 
  categories,
  onScheduleAdded 
}: ScheduleDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startTime: '',
    endTime: '',
    category: categories.length > 0 ? categories[0] : '',
    emoji: '',
    backgroundColor: '#f8fafc',
    textColor: '#334155'
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.category && categories.length === 0) {
      setError('카테고리가 설정되지 않았습니다.');
      return;
    }

    const scheduleData: Schedule = {
      id: `schedule_${Date.now()}`,
      title: formData.title.trim(),
      content: formData.content.trim(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category || categories[0] || '기타',
      emoji: formData.emoji,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      createdAt: new Date().toISOString()
    };

    try {
      addSchedule(accessCode, scheduleData);
      onScheduleAdded();
      handleClose();
    } catch (error) {
      console.error('일정 저장 오류:', error);
      setError('일정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      startTime: '',
      endTime: '',
      category: categories.length > 0 ? categories[0] : '',
      emoji: '',
      backgroundColor: '#f8fafc',
      textColor: '#334155'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>새 일정 추가</DialogTitle>
          <p className="text-sm text-gray-500">
            {format(selectedDate, 'yyyy년 M월 d일')}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="일정 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="일정에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">시작 시간</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">종료 시간</label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-2">이모지</label>
              <Input
                value={formData.emoji}
                onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="📅"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">배경색</label>
            <Input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="h-10"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              disabled={!formData.title.trim()}
            >
              추가
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 