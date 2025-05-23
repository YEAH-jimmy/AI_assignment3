'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Folder, CheckSquare, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from './button';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

interface NavigationProps {
  accessCode: string;
}

export function Navigation({ accessCode }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth, isDarkMode, toggleDarkMode } = useAuthStore();

  const navItems = [
    {
      href: `/home?code=${accessCode}`,
      icon: Calendar,
      label: '홈',
      active: pathname === '/home'
    },
    {
      href: `/folders?code=${accessCode}`,
      icon: Folder,
      label: '폴더',
      active: pathname === '/folders'
    },
    {
      href: `/todo?code=${accessCode}`,
      icon: CheckSquare,
      label: '할 일',
      active: pathname === '/todo'
    }
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              ScheduleNest
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">({accessCode})</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? 'default' : 'ghost'}
                  className={`flex items-center space-x-2 ${
                    item.active 
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-slate-600 pl-4">
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700"
              title={isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="나가기"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 