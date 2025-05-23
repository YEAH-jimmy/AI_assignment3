'use client';

import { UserData, Schedule, Todo, Note, Folder } from './types';

const STORAGE_PREFIX = 'schedulenest_';

export const generateAccessCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getStorageKey = (accessCode: string): string => {
  return `${STORAGE_PREFIX}${accessCode}`;
};

export const getUserData = (accessCode: string): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  const storageKey = getStorageKey(accessCode);
  const data = localStorage.getItem(storageKey);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

export const saveUserData = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  
  const storageKey = getStorageKey(userData.accessCode);
  localStorage.setItem(storageKey, JSON.stringify(userData));
};

export const createInitialUserData = (accessCode: string): UserData => {
  const defaultCategories = ['개인', '업무', '학교', '기타'];
  const defaultFolders: Folder[] = defaultCategories.map(category => ({
    id: `folder_${category}`,
    name: category,
    isDefault: true,
    notes: []
  }));

  return {
    accessCode,
    schedules: [],
    todos: [],
    folders: defaultFolders,
    categories: defaultCategories
  };
};

export const accessCodeExists = (accessCode: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const storageKey = getStorageKey(accessCode);
  return localStorage.getItem(storageKey) !== null;
};

export const addSchedule = (accessCode: string, schedule: Schedule): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.schedules.push(schedule);
  saveUserData(userData);
};

export const updateSchedule = (accessCode: string, scheduleId: string, updates: Partial<Schedule>): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  const index = userData.schedules.findIndex(s => s.id === scheduleId);
  if (index !== -1) {
    userData.schedules[index] = { ...userData.schedules[index], ...updates };
    saveUserData(userData);
  }
};

export const deleteSchedule = (accessCode: string, scheduleId: string): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.schedules = userData.schedules.filter(s => s.id !== scheduleId);
  saveUserData(userData);
};

export const addTodo = (accessCode: string, todo: Todo): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.todos.push(todo);
  saveUserData(userData);
};

export const updateTodo = (accessCode: string, todoId: string, updates: Partial<Todo>): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  const index = userData.todos.findIndex(t => t.id === todoId);
  if (index !== -1) {
    userData.todos[index] = { ...userData.todos[index], ...updates };
    saveUserData(userData);
  }
};

export const deleteTodo = (accessCode: string, todoId: string): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.todos = userData.todos.filter(t => t.id !== todoId);
  saveUserData(userData);
};

export const addNote = (accessCode: string, note: Note): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  const folder = userData.folders.find(f => f.id === note.folderId);
  if (folder) {
    folder.notes.push(note);
    saveUserData(userData);
  }
};

export const updateNote = (accessCode: string, noteId: string, updates: Partial<Note>): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  for (const folder of userData.folders) {
    const noteIndex = folder.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      folder.notes[noteIndex] = { ...folder.notes[noteIndex], ...updates, updatedAt: new Date().toISOString() };
      saveUserData(userData);
      break;
    }
  }
};

export const deleteNote = (accessCode: string, noteId: string): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  for (const folder of userData.folders) {
    folder.notes = folder.notes.filter(n => n.id !== noteId);
  }
  saveUserData(userData);
};

export const addFolder = (accessCode: string, folder: Folder): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.folders.push(folder);
  saveUserData(userData);
};

export const deleteFolder = (accessCode: string, folderId: string): void => {
  const userData = getUserData(accessCode);
  if (!userData) return;
  
  userData.folders = userData.folders.filter(f => f.id !== folderId);
  saveUserData(userData);
}; 