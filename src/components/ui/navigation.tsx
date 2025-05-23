'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Folder, CheckSquare, LogOut } from 'lucide-react';
import { Button } from './button';
import { useAuthStore } from '@/lib/store';

interface NavigationProps {
  accessCode: string;
}

export function Navigation({ accessCode }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const navItems = [
    {
      name: '홈',
      href: `/home?code=${accessCode}`,
      icon: Calendar,
      active: pathname === '/home'
    },
    {
      name: '폴더',
      href: `/folders?code=${accessCode}`,
      icon: Folder,
      active: pathname === '/folders'
    },
    {
      name: '할 일',
      href: `/todo?code=${accessCode}`,
      icon: CheckSquare,
      active: pathname === '/todo'
    }
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            ScheduleNest
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({accessCode})
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Button>
            );
          })}
          
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">나가기</span>
          </Button>
        </div>
      </div>
    </nav>
  );
} 