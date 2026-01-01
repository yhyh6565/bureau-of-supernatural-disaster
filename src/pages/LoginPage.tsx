import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

import { Logo } from '@/components/ui/Logo';

export function LoginPage() {
  const { login } = useAuth();
  const [personaKey, setPersonaKey] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(personaKey);
    if (!success) {
      setError('등록되지 않은 페르소나입니다. 시스템 관리자에게 문의하세요.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      {/* 배경 패턴 */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`
        }} />
      </div>

      {/* 로고 영역 */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
          <Logo />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">초자연재난관리국</h1>
          <p className="text-base sm:text-lg font-bold text-muted-foreground">통합 행정 시스템</p>
        </div>
      </div>

      {/* 로그인 카드 */}
      <Card className="w-full max-w-md card-gov">
        <CardHeader className="text-center border-b border-border pb-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <span className="font-medium">보안 접속</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 아이디 입력 */}
            <div className="space-y-2">
              <Label htmlFor="persona" className="text-sm font-medium">
                아이디 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="persona"
                type="text"
                placeholder="아이디 입력"
                value={personaKey}
                onChange={(e) => setPersonaKey(e.target.value)}
                className="h-11 rounded-sm"
                maxLength={20}
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full h-11 rounded-sm font-medium"
              disabled={isLoading || !personaKey}
            >
              {isLoading ? '인증 중...' : '접속'}
            </Button>
          </form>

          {/* 안내 문구 */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              본 시스템은 <span className="text-destructive font-medium">대외비</span> 등급의 정부 행정망입니다.<br />
              무단 접근 시 「국가보안법」에 의거 처벌됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 하단 정보 */}
      <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
        <p>© 2025 초자연재난관리국</p>
      </div>
    </div>
  );
}
