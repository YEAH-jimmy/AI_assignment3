'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAccessCode, accessCodeExists, createInitialUserData, saveUserData } from '@/lib/storage';
import { useAuthStore } from '@/lib/store';
import { Calendar, Folder, CheckSquare, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { setAccessCode: setStoreAccessCode } = useAuthStore();

  const handleAccessCodeSubmit = () => {
    if (!accessCode.trim()) {
      setError('접속 코드를 입력해주세요.');
      return;
    }

    if (accessCode.length < 4 || accessCode.length > 8) {
      setError('접속 코드는 4-8자리여야 합니다.');
      return;
    }

    if (!/^[a-z0-9]+$/.test(accessCode)) {
      setError('접속 코드는 영어 소문자와 숫자만 사용할 수 있습니다.');
      return;
    }

    if (!accessCodeExists(accessCode)) {
      setError('존재하지 않는 접속 코드입니다. 새로운 코드를 생성해주세요.');
      return;
    }

    setStoreAccessCode(accessCode);
    router.push(`/home?code=${accessCode}`);
  };

  const handleGenerateNewCode = () => {
    setIsGenerating(true);
    const newCode = generateAccessCode();
    const userData = createInitialUserData(newCode);
    saveUserData(userData);
    
    setStoreAccessCode(newCode);
    setTimeout(() => {
      router.push(`/home?code=${newCode}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ScheduleNest
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            간단한 접속 코드로 시작하는 개인 일정 관리
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400">일정</p>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <Folder className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400">노트</p>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <CheckSquare className="w-6 h-6 mx-auto mb-1 text-orange-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400">할 일</p>
          </div>
        </div>

        {/* Access Code Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">접속하기</CardTitle>
            <CardDescription>
              기존 접속 코드를 입력하거나 새로운 코드를 생성하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="접속 코드 입력 (예: abc123)"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toLowerCase());
                  setError('');
                }}
                className="text-center text-lg tracking-wider"
                maxLength={8}
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleAccessCodeSubmit}
                className="w-full bg-indigo-500 hover:bg-indigo-600"
                disabled={!accessCode.trim()}
              >
                접속하기
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-gray-500">또는</span>
                </div>
              </div>

              <Button 
                onClick={handleGenerateNewCode}
                variant="outline"
                className="w-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/20"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>생성 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>새로운 코드 생성</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>접속 코드는 4-8자리 영문과 숫자로 구성됩니다</p>
          <p>모든 데이터는 브라우저에 안전하게 저장됩니다</p>
        </div>
      </div>
    </div>
  );
}
