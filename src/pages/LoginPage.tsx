import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

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
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
          <span className="text-4xl">🦁</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">환경부 초자연재난관리국</p>
          <h1 className="text-2xl font-bold text-foreground">통합 행정 시스템</h1>
          <p className="text-3xl font-black text-primary tracking-wider">해태</p>
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
            {/* 페르소나 키 입력 */}
            <div className="space-y-2">
              <Label htmlFor="persona" className="text-sm font-medium">
                페르소나 키 (이름) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="persona"
                type="text"
                placeholder="한글 이름 석 자 입력"
                value={personaKey}
                onChange={(e) => setPersonaKey(e.target.value)}
                className="h-11 rounded-sm"
                maxLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                예시: 김솔음, 박현무, 이주작
              </p>
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
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                ※ 형식적 절차입니다. 페르소나 권한으로 접속됩니다.
              </p>
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
        <p>© 2025 환경부 초자연재난관리국</p>
        <p className="font-mono">v1.0.0-CLASSIFIED</p>
      </div>
    </div>
  );
}
