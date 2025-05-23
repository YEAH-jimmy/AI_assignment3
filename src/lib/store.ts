'use client';

import { create } from 'zustand';
import { UserData } from './types';
import { getUserData } from './storage';

interface AuthStore {
  accessCode: string;
  userData: UserData | null;
  isDarkMode: boolean;
  isAuthenticated: boolean;
  setAccessCode: (code: string) => void;
  loadUserData: (code: string) => void;
  clearAuth: () => void;
  refreshUserData: () => void;
  toggleDarkMode: () => void;
}

// localStorage에서 다크모드 설정 불러오기
const loadDarkModeFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const saved = localStorage.getItem('schedulenest_darkmode');
    return saved === 'true';
  } catch (error) {
    console.error('다크모드 설정 로드 오류:', error);
    return false;
  }
};

// localStorage에 다크모드 설정 저장
const saveDarkModeToStorage = (isDark: boolean) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('schedulenest_darkmode', isDark.toString());
  } catch (error) {
    console.error('다크모드 설정 저장 오류:', error);
  }
};

// 다크모드 클래스 적용
const applyDarkModeToDOM = (isDark: boolean) => {
  if (typeof window === 'undefined') return;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessCode: '',
  userData: null,
  isDarkMode: loadDarkModeFromStorage(),
  isAuthenticated: false,
  
  setAccessCode: (code) => set({ accessCode: code }),
  
  loadUserData: (code) => {
    const data = getUserData(code);
    set({ userData: data });
  },
  
  clearAuth: () => {
    set({ 
      accessCode: '', 
      userData: null, 
      isAuthenticated: false 
    });
  },
  
  refreshUserData: () => {
    const { accessCode } = get();
    if (accessCode) {
      const data = getUserData(accessCode);
      set({ userData: data });
    }
  },
  
  toggleDarkMode: () => {
    const { isDarkMode } = get();
    const newDarkMode = !isDarkMode;
    
    set({ isDarkMode: newDarkMode });
    saveDarkModeToStorage(newDarkMode);
    applyDarkModeToDOM(newDarkMode);
  }
}));

// 초기 다크모드 적용
if (typeof window !== 'undefined') {
  const initialDarkMode = loadDarkModeFromStorage();
  applyDarkModeToDOM(initialDarkMode);
} 