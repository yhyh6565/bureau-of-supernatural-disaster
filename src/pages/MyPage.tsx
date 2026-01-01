import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/types/haetae';
import { FUNERAL_OPTIONS } from '@/constants/haetae';
import { User, Phone, Building2, Shield, Heart, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export function MyPage() {
  const { agent } = useAuth();
  const [selectedFuneral, setSelectedFuneral] = useState('funeral-001');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  const handleFuneralSave = () => {
    const selectedOption = FUNERAL_OPTIONS.find(f => f.id === selectedFuneral);
    toast({
      title: '장례법 지정 완료',
      description: `"${selectedOption?.name}" 방식으로 저장되었습니다. 인사기록 DB에 반영됩니다.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold">개인정보</h1>
        <p className="text-sm text-muted-foreground">나의 신원 정보 및 설정을 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-12">
        {/* 기본 정보 카드 */}
        <Card className="card-gov">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              기본 신원 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">이름</span>
                <p className="font-medium">{agent.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">요원 ID</span>
                <p className="font-mono text-sm">{agent.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">직급</span>
                <p className="font-medium">{agent.rank}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">소속</span>
                <div className="flex items-center gap-2">
                  <span>{deptInfo.icon}</span>
                  <span className="font-medium">{deptInfo.name} ({deptInfo.fullName})</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">내선번호:</span>
                <span className="font-mono">{agent.extension}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상태 정보 카드 */}
        <Card className="card-gov">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              상태 및 보안 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">근무 상태</span>
                <Badge
                  className={
                    agent.status === '정상'
                      ? 'bg-success text-success-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  }
                >
                  {agent.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">페르소나 키</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {agent.name} (활성)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">보안 등급</span>
                <span className="text-sm font-medium text-primary">2등급 (대외비)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">정신 오염도</span>
                <span className="text-sm font-mono">12.4% (정상)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 특수 행정 정보 카드 */}
        <Card className="card-gov lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              특수 행정 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-sm border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="font-medium">장례법 지정</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  순직 시 희망하는 장례 절차를 미리 지정할 수 있습니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  현재 지정: <span className="font-medium text-foreground">화장</span>
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-sm">
                    장례법 지정 신청
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      장례법 지정 신청
                    </DialogTitle>
                    <DialogDescription>
                      순직 시 희망하는 장례 절차를 선택하십시오.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <RadioGroup value={selectedFuneral} onValueChange={setSelectedFuneral}>
                      {FUNERAL_OPTIONS.map((option) => (
                        <div key={option.id} className="flex items-start space-x-3 p-3 rounded-sm border border-border hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleFuneralSave}>
                      저장
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default MyPage;
