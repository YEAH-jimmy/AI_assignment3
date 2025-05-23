'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Folder as FolderIcon, File, Trash2, Edit3 } from 'lucide-react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { getUserData, addNote, updateNote, deleteNote, addFolder, deleteFolder } from '@/lib/storage';
import { Note, Folder } from '@/lib/types';

interface FoldersPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default function FoldersPage({ searchParams }: FoldersPageProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [accessCode, setAccessCode] = useState<string>('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { loadUserData, refreshUserData } = useAuthStore();

  // Form states
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const [folderFormData, setFolderFormData] = useState({
    name: ''
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
          setFolders(data.folders);
          setCategories(data.categories);
          if (data.folders.length > 0) {
            setSelectedFolder(data.folders[0]);
          }
        }
      }
    };

    initializeData();
  }, [searchParams, loadUserData]);

  const handleNoteSubmit = () => {
    if (!noteFormData.title.trim() || !selectedFolder) return;

    const noteData: Note = {
      id: editingNote?.id || `note_${Date.now()}`,
      title: noteFormData.title,
      content: noteFormData.content,
      category: noteFormData.category || categories[0],
      folderId: selectedFolder.id,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingNote) {
      updateNote(accessCode, editingNote.id, noteData);
    } else {
      addNote(accessCode, noteData);
    }

    refreshData();
    resetNoteForm();
  };

  const handleFolderSubmit = () => {
    if (!folderFormData.name.trim()) return;

    const folderData: Folder = {
      id: `folder_${Date.now()}`,
      name: folderFormData.name,
      isDefault: false,
      notes: []
    };

    addFolder(accessCode, folderData);
    refreshData();
    resetFolderForm();
  };

  const handleNoteEdit = (note: Note) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setShowNoteForm(true);
  };

  const handleNoteDelete = (noteId: string) => {
    deleteNote(accessCode, noteId);
    refreshData();
  };

  const handleFolderDelete = (folderId: string) => {
    deleteFolder(accessCode, folderId);
    refreshData();
    if (selectedFolder?.id === folderId) {
      setSelectedFolder(folders.length > 1 ? folders[0] : null);
    }
  };

  const refreshData = () => {
    const data = getUserData(accessCode);
    if (data) {
      setFolders(data.folders);
      if (selectedFolder) {
        const updatedFolder = data.folders.find(f => f.id === selectedFolder.id);
        setSelectedFolder(updatedFolder || data.folders[0] || null);
      }
    }
    refreshUserData();
  };

  const resetNoteForm = () => {
    setNoteFormData({
      title: '',
      content: '',
      category: ''
    });
    setEditingNote(null);
    setShowNoteForm(false);
  };

  const resetFolderForm = () => {
    setFolderFormData({
      name: ''
    });
    setShowFolderForm(false);
  };

  if (!accessCode) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation accessCode={accessCode} />
      
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>폴더</span>
                  <Button 
                    size="sm"
                    onClick={() => setShowFolderForm(true)}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFolder?.id === folder.id
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="w-4 h-4" />
                      <span className="text-sm">{folder.name}</span>
                      <Badge className="text-xs">
                        {folder.notes.length}
                      </Badge>
                    </div>
                    {!folder.isDefault && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFolderDelete(folder.id);
                        }}
                        className="p-1 h-6 w-6 bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Folder Form */}
            {showFolderForm && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>새 폴더 추가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">폴더명 *</label>
                    <Input
                      value={folderFormData.name}
                      onChange={(e) => setFolderFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="폴더명을 입력하세요"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleFolderSubmit} className="bg-indigo-500 hover:bg-indigo-600">
                      추가
                    </Button>
                    <Button onClick={resetFolderForm}>
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedFolder ? (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedFolder.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedFolder.notes.length}개의 노트
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowNoteForm(true)}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    노트 추가
                  </Button>
                </div>

                {/* Note Form */}
                {showNoteForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingNote ? '노트 수정' : '새 노트 추가'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">제목 *</label>
                          <Input
                            value={noteFormData.title}
                            onChange={(e) => setNoteFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="노트 제목을 입력하세요"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">카테고리</label>
                          <Select 
                            value={noteFormData.category} 
                            onValueChange={(value) => setNoteFormData(prev => ({ ...prev, category: value }))}
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
                        <label className="block text-sm font-medium mb-2">내용</label>
                        <Textarea
                          value={noteFormData.content}
                          onChange={(e) => setNoteFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="노트 내용을 입력하세요"
                          rows={8}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={handleNoteSubmit} className="bg-indigo-500 hover:bg-indigo-600">
                          {editingNote ? '수정' : '추가'}
                        </Button>
                        <Button onClick={resetNoteForm}>
                          취소
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes List */}
                <div className="grid gap-4">
                  {selectedFolder.notes.length > 0 ? (
                    selectedFolder.notes.map((note) => (
                      <Card key={note.id} className="transition-all hover:shadow-md">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <File className="w-4 h-4 text-gray-400" />
                                <h3 className="font-semibold text-lg">{note.title}</h3>
                                <Badge className="text-xs">
                                  {note.category}
                                </Badge>
                              </div>
                              
                              {note.content && (
                                <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                                  {note.content.slice(0, 200)}
                                  {note.content.length > 200 && '...'}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>생성: {format(new Date(note.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}</span>
                                <span>수정: {format(new Date(note.updatedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}</span>
                              </div>
                            </div>

                            <div className="flex space-x-1 ml-4">
                              <Button
                                onClick={() => handleNoteEdit(note)}
                                className="p-2 h-8 w-8 bg-blue-500 hover:bg-blue-600"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleNoteDelete(note.id)}
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
                        <p className="text-gray-500">이 폴더에 노트가 없습니다.</p>
                        <Button 
                          onClick={() => setShowNoteForm(true)}
                          className="mt-4 bg-indigo-500 hover:bg-indigo-600"
                        >
                          첫 번째 노트 추가하기
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">폴더를 선택해주세요.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 