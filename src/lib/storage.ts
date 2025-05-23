'use client';

import { UserData, Schedule, Todo, Note, Folder } from './types';

const STORAGE_PREFIX = 'schedulenest_';
const MAPPING_PREFIX = 'schedulenest_mapping_';

export const generateAccessCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 사용자 코드 → 시스템 코드 매핑 저장
export const saveCodeMapping = (userCode: string, systemCode: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const mappingKey = `${MAPPING_PREFIX}${userCode}`;
    localStorage.setItem(mappingKey, systemCode);
    console.log(`[DEBUG] 코드 매핑 저장: ${userCode} → ${systemCode}`);
  } catch (error) {
    console.error('코드 매핑 저장 오류:', error);
  }
};

// 사용자 코드로 시스템 코드 찾기
export const getSystemCode = (userCode: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const mappingKey = `${MAPPING_PREFIX}${userCode}`;
    const systemCode = localStorage.getItem(mappingKey);
    console.log(`[DEBUG] 코드 매핑 조회: ${userCode} → ${systemCode}`);
    return systemCode;
  } catch (error) {
    console.error('코드 매핑 조회 오류:', error);
    return null;
  }
};

export const getStorageKey = (accessCode: string): string => {
  return `${STORAGE_PREFIX}${accessCode}`;
};

export const getUserData = (userCode: string): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // 사용자 코드로 시스템 코드 찾기
    const systemCode = getSystemCode(userCode);
    if (!systemCode) {
      console.log(`[DEBUG] 매핑된 시스템 코드를 찾을 수 없음: ${userCode}`);
      return null;
    }
    
    const storageKey = getStorageKey(systemCode);
    const data = localStorage.getItem(storageKey);
    
    console.log(`[DEBUG] getUserData - 사용자코드: ${userCode}, 시스템코드: ${systemCode}, storageKey: ${storageKey}`);
    console.log(`[DEBUG] Retrieved data:`, data);
    
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    console.log(`[DEBUG] Parsed data:`, parsed);
    return parsed;
  } catch (error) {
    console.error('getUserData 오류:', error);
    return null;
  }
};

export const saveUserData = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // userData.accessCode는 시스템 코드
    const storageKey = getStorageKey(userData.accessCode);
    const dataString = JSON.stringify(userData);
    
    console.log(`[DEBUG] saveUserData - 시스템코드: ${userData.accessCode}, storageKey: ${storageKey}`);
    console.log(`[DEBUG] Saving data:`, userData);
    
    localStorage.setItem(storageKey, dataString);
    
    // 저장 확인
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      console.log(`[DEBUG] 데이터 저장 성공!`);
    } else {
      console.error(`[DEBUG] 데이터 저장 실패!`);
    }
  } catch (error) {
    console.error('saveUserData 오류:', error);
    alert('데이터 저장 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
};

export const createInitialUserData = (systemCode: string): UserData => {
  const defaultCategories = ['개인', '업무', '학교', '기타'];
  const defaultFolders: Folder[] = defaultCategories.map(category => ({
    id: `folder_${category}`,
    name: category,
    isDefault: true,
    notes: []
  }));

  const userData = {
    accessCode: systemCode, // 시스템 코드로 저장
    schedules: [],
    todos: [],
    folders: defaultFolders,
    categories: defaultCategories
  };

  console.log(`[DEBUG] createInitialUserData:`, userData);
  return userData;
};

export const accessCodeExists = (userCode: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const systemCode = getSystemCode(userCode);
    if (!systemCode) return false;
    
    const storageKey = getStorageKey(systemCode);
    const exists = localStorage.getItem(storageKey) !== null;
    console.log(`[DEBUG] accessCodeExists - 사용자코드: ${userCode}, 시스템코드: ${systemCode}, 존재: ${exists}`);
    return exists;
  } catch (error) {
    console.error('accessCodeExists 오류:', error);
    return false;
  }
};

// 새로운 함수: 사용자 코드와 시스템 코드 매핑 생성
export const createCodeMapping = (userCode: string): string => {
  const systemCode = generateAccessCode();
  saveCodeMapping(userCode, systemCode);
  return systemCode;
};

export const addSchedule = (userCode: string, schedule: Schedule): void => {
  try {
    console.log(`[DEBUG] addSchedule 시작:`, { userCode, schedule });
    
    const userData = getUserData(userCode);
    if (!userData) {
      console.error('사용자 데이터를 찾을 수 없습니다.');
      return;
    }
    
    userData.schedules.push(schedule);
    console.log(`[DEBUG] 일정 추가 후 데이터:`, userData);
    
    saveUserData(userData);
    console.log(`[DEBUG] addSchedule 완료`);
  } catch (error) {
    console.error('addSchedule 오류:', error);
    alert('일정 추가 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
};

export const updateSchedule = (userCode: string, scheduleId: string, updates: Partial<Schedule>): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    const index = userData.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      userData.schedules[index] = { ...userData.schedules[index], ...updates };
      saveUserData(userData);
      console.log(`[DEBUG] updateSchedule 완료:`, scheduleId);
    }
  } catch (error) {
    console.error('updateSchedule 오류:', error);
  }
};

export const deleteSchedule = (userCode: string, scheduleId: string): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    userData.schedules = userData.schedules.filter(s => s.id !== scheduleId);
    saveUserData(userData);
    console.log(`[DEBUG] deleteSchedule 완료:`, scheduleId);
  } catch (error) {
    console.error('deleteSchedule 오류:', error);
  }
};

export const addTodo = (userCode: string, todo: Todo): void => {
  try {
    console.log(`[DEBUG] addTodo 시작:`, { userCode, todo });
    
    const userData = getUserData(userCode);
    if (!userData) {
      console.error('사용자 데이터를 찾을 수 없습니다.');
      return;
    }
    
    userData.todos.push(todo);
    console.log(`[DEBUG] 할 일 추가 후 데이터:`, userData);
    
    saveUserData(userData);
    console.log(`[DEBUG] addTodo 완료`);
  } catch (error) {
    console.error('addTodo 오류:', error);
    alert('할 일 추가 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
};

export const updateTodo = (userCode: string, todoId: string, updates: Partial<Todo>): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    const index = userData.todos.findIndex(t => t.id === todoId);
    if (index !== -1) {
      userData.todos[index] = { ...userData.todos[index], ...updates };
      saveUserData(userData);
      console.log(`[DEBUG] updateTodo 완료:`, todoId);
    }
  } catch (error) {
    console.error('updateTodo 오류:', error);
  }
};

export const deleteTodo = (userCode: string, todoId: string): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    userData.todos = userData.todos.filter(t => t.id !== todoId);
    saveUserData(userData);
    console.log(`[DEBUG] deleteTodo 완료:`, todoId);
  } catch (error) {
    console.error('deleteTodo 오류:', error);
  }
};

export const addNote = (userCode: string, note: Note): void => {
  try {
    console.log(`[DEBUG] addNote 시작:`, { userCode, note });
    
    const userData = getUserData(userCode);
    if (!userData) return;
    
    const folder = userData.folders.find(f => f.id === note.folderId);
    if (folder) {
      folder.notes.push(note);
      saveUserData(userData);
      console.log(`[DEBUG] addNote 완료`);
    } else {
      console.error('폴더를 찾을 수 없습니다:', note.folderId);
    }
  } catch (error) {
    console.error('addNote 오류:', error);
  }
};

export const updateNote = (userCode: string, noteId: string, updates: Partial<Note>): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    for (const folder of userData.folders) {
      const noteIndex = folder.notes.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        folder.notes[noteIndex] = { ...folder.notes[noteIndex], ...updates, updatedAt: new Date().toISOString() };
        saveUserData(userData);
        console.log(`[DEBUG] updateNote 완료:`, noteId);
        break;
      }
    }
  } catch (error) {
    console.error('updateNote 오류:', error);
  }
};

export const deleteNote = (userCode: string, noteId: string): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    for (const folder of userData.folders) {
      folder.notes = folder.notes.filter(n => n.id !== noteId);
    }
    saveUserData(userData);
    console.log(`[DEBUG] deleteNote 완료:`, noteId);
  } catch (error) {
    console.error('deleteNote 오류:', error);
  }
};

export const addFolder = (userCode: string, folder: Folder): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    userData.folders.push(folder);
    saveUserData(userData);
    console.log(`[DEBUG] addFolder 완료:`, folder.name);
  } catch (error) {
    console.error('addFolder 오류:', error);
  }
};

export const deleteFolder = (userCode: string, folderId: string): void => {
  try {
    const userData = getUserData(userCode);
    if (!userData) return;
    
    userData.folders = userData.folders.filter(f => f.id !== folderId);
    saveUserData(userData);
    console.log(`[DEBUG] deleteFolder 완료:`, folderId);
  } catch (error) {
    console.error('deleteFolder 오류:', error);
  }
}; 