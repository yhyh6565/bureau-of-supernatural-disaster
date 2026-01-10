import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Shield, Phone, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Logo } from '@/components/ui/Logo';

// 특수 페르소나: 본명이 아닌 가명/코드명 (원작 설정)
const SPECIAL_PERSONAS = ['최요원', '해금'];
// 접속 금지된 이름 (죄인 명단)
const FORBIDDEN_NAMES = [
  '호유원', '청달래', '백석주', '진나솔', '이석종', '강도준', '이성해',
  '이자헌', '은하제', '박민성', '윤조훈', '백사헌', '강이학', '이재진',
  '이승조', '곽제강', '이연화', '최명진', '박경환', '이병진', '이강헌', '김허운'
];
const EMERGENCY_CALL_NUMBER = '1717828242';

export function LoginPage() {
  const { login } = useAuthStore();
  const { triggerGameOver } = useGameStore();
  const [personaKey, setPersonaKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 특수 인증 관련 상태
  const [showIdentityWarning, setShowIdentityWarning] = useState(false);
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyError, setEmergencyError] = useState('');
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [blockedPersona, setBlockedPersona] = useState('');

  // 경고 팝업 5초 후 자동 사라짐
  useEffect(() => {
    if (showIdentityWarning) {
      const timer = setTimeout(() => {
        setShowIdentityWarning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showIdentityWarning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedKey = personaKey.trim();

    // 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 800));

    // 금지된 이름 체크 (시스템 즉결 처형 - Game Over 시퀀스)
    if (FORBIDDEN_NAMES.includes(trimmedKey)) {
      triggerGameOver('forbidden_login');
      return;
    }

    // 특수 페르소나 체크 (최요원, 해금)
    if (SPECIAL_PERSONAS.includes(trimmedKey)) {
      setIsLoading(false);
      setBlockedPersona(trimmedKey);
      setShowIdentityWarning(true);
      setShowEmergencyButton(true);  // 긴급 인증 버튼 표시
      return;
    }

    const success = login(trimmedKey);
    if (!success) {
      setError('등록되지 않은 페르소나입니다. 시스템 관리자에게 문의하세요.');
      setIsLoading(false);
    }
    // 성공 시 상태 업데이트 없이 리다이렉트를 기다림 (AuthContext -> PublicRoute)
  };

  const handleEmergencyLogin = () => {
    setShowEmergencyModal(true);
    setEmergencyNumber('');
    setEmergencyError('');
    setEmergencySuccess(false);
  };

  const handleEmergencySubmit = async () => {
    setEmergencyError('');

    if (emergencyNumber !== EMERGENCY_CALL_NUMBER) {
      setEmergencyError('유효하지 않은 번호입니다.');
      return;
    }

    setIsEmergencyLoading(true);

    // 5초 로딩 애니메이션
    await new Promise(resolve => setTimeout(resolve, 5000));

    setIsEmergencyLoading(false);
    setEmergencySuccess(true);

    // 인증 성공 메시지 표시 후 로그인
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 성공 시 모달을 닫거나 상태를 변경하지 않고 바로 로그인 처리
    login(blockedPersona);
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

      {/* 정의할 수 없는 신원 경고 팝업 */}
      {showIdentityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-destructive text-destructive-foreground px-8 py-6 rounded-lg shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg font-bold">정의할 수 없는 신원입니다</span>
            </div>
          </div>
        </div>
      )}

      {/* 긴급 인증 모달 */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              긴급 인증
            </DialogTitle>
            <DialogDescription className="space-y-1">
              <span className="block">긴급구호요청 콜번호를 입력하시오.</span>
              <span className="block text-xs">숫자만 입력하시오.</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isEmergencyLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">인증 중...</span>
              </div>
            ) : emergencySuccess ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-lg font-medium text-green-600">인증되었습니다</span>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="콜번호 입력"
                  value={emergencyNumber}
                  onChange={(e) => setEmergencyNumber(e.target.value.replace(/\D/g, ''))}
                  className="h-11 text-center text-lg tracking-widest"
                  maxLength={15}
                  autoFocus
                />

                {emergencyError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{emergencyError}</span>
                  </div>
                )}

                <Button
                  onClick={handleEmergencySubmit}
                  className="w-full h-11"
                  disabled={!emergencyNumber}
                >
                  인증
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="persona"
                type="text"
                placeholder="이름을 입력하십시오."
                value={personaKey}
                onChange={(e) => setPersonaKey(e.target.value)}
                className="h-11 rounded-sm"
                maxLength={20}
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="space-y-2">
              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full h-11 rounded-sm font-medium"
                disabled={isLoading || !personaKey}
              >
                {isLoading ? '인증 중...' : '접속'}
              </Button>

              {/* 긴급 인증 버튼 (특수 페르소나 차단 시에만 표시) */}
              {showEmergencyButton && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-sm font-medium border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleEmergencyLogin}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  긴급 인증
                </Button>
              )}
            </div>
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
        <p className="text-[10px] text-gray-500 text-center px-4 leading-relaxed">
          Copyright © 2025 All rights reserved. | 본 페이지는 비공식 팬 페이지로, '괴담에 떨어져도 출근을 해야 하는구나' IP 및 제반 권리는 원작자에게 귀속됩니다.
        </p>
      </div>
    </div>
  );
}
