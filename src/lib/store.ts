'use client';

import { create } from 'zustand';
import { UserData } from './types';
import { getUserData } from './storage';

interface AuthStore {
  accessCode: string | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  setAccessCode: (code: string) => void;
  loadUserData: (code: string) => void;
  clearAuth: () => void;
  refreshUserData: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessCode: null,
  userData: null,
  isAuthenticated: false,
  
  setAccessCode: (code: string) => {
    set({ accessCode: code });
  },
  
  loadUserData: (code: string) => {
    const userData = getUserData(code);
    set({ 
      accessCode: code, 
      userData, 
      isAuthenticated: userData !== null 
    });
  },
  
  clearAuth: () => {
    set({ 
      accessCode: null, 
      userData: null, 
      isAuthenticated: false 
    });
  },
  
  refreshUserData: () => {
    const { accessCode } = get();
    if (accessCode) {
      const userData = getUserData(accessCode);
      set({ userData });
    }
  }
})); 