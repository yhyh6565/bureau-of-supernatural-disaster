import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useResourceStore } from '@/store/resourceStore';
import { useBureauStore } from '@/store/bureauStore';
import { DEPARTMENT_INFO } from '@/constants/haetae';
import { FUNERAL_OPTIONS } from '@/constants/haetae';
import { User, Phone, Shield, Heart, AlertTriangle, Package, Calendar, Brain, Hash } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
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
  const { agent } = useAuthStore();
  const { contamination } = useGameStore();
  const { rentals } = useResourceStore();
  const { mode } = useBureauStore();
  const [selectedFuneral, setSelectedFuneral] = useState('funeral-001');
  const [currentFuneral, setCurrentFuneral] = useState('화장');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  const isSegwang = mode === 'segwang';
  const redact = (text: string) => text.split('').map(() => '■').join('');

  const displayName = isSegwang ? redact(agent.name) : agent.name;
  const displayCodename = isSegwang ? redact(agent.codename) : agent.codename;
  const displayRank = isSegwang ? redact(agent.rank) : agent.rank;
  const displayExtension = isSegwang ? redact(agent.extension) : agent.extension;
  const displayDeptName = isSegwang ? redact(deptInfo.name) : deptInfo.name;
  const displayDeptFullName = isSegwang ? redact(deptInfo.fullName) : deptInfo.fullName;

  const displayStatus = isSegwang ? '■■' : agent.status;
  const displayContamination = isSegwang ? 100 : Math.round(contamination);

  const handleFuneralSave = () => {
    const selectedOption = FUNERAL_OPTIONS.find(f => f.id === selectedFuneral);
    if (selectedOption) {
      setCurrentFuneral(selectedOption.name);
    }
    toast({
      title: '장례법 지정 완료',
      description: `"${selectedOption?.name}" 방식으로 저장되었습니다. 인사기록 DB에 반영됩니다.`,
    });
    setIsDialogOpen(false);
  };

  // 장비 반납 스케줄용 데이터 (반납일 있는 것만 필터링 후 정렬)
  const returnSchedule = rentals
    .filter(item => item.category === '대여' && item.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <MainLayout>
      <div className="space-y-4 pb-12">

        {/* 상단 3열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* 1. 기본 신원 정보 */}
          <Card className="card-gov h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                기본 신원 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">이름</span>
                  <p className="font-medium">{displayName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">요원명</span>
                  <p className="font-bold text-primary">{displayCodename}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">직급</span>
                  <p className="font-medium">{displayRank}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">내선번호</span>
                  <p className="font-mono">{displayExtension}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">소속</span>
                  <div className="flex items-center gap-2">
                    <deptInfo.icon className="w-4 h-4" />
                    <span className="font-medium">{displayDeptName} ({displayDeptFullName})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 상태 및 보안 정보 */}
          <Card className="card-gov h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                상태 및 보안 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">근무 상태</span>
                <Badge
                  className={
                    displayStatus === '정상'
                      ? 'bg-success text-success-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  }
                >
                  {displayStatus}
                </Badge>
              </div>



              <div className="flex items-center justify-between py-1 border-t border-border">
                <span className="text-sm text-muted-foreground">정신 오염도</span>
                <span className={`text-sm font-mono font-medium ${displayContamination >= 80 ? 'text-destructive' : displayContamination >= 50 ? 'text-warning' : 'text-success'}`}>
                  {displayContamination}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 3. 특수 행정 정보 */}
          <Card className="card-gov h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                특수 행정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium text-sm">장례법 지정</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  순직 시 진행될 장례 절차를 지정합니다. 미지정 시 공용 데이터 소각장에서 처리됩니다.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span className="text-xs text-muted-foreground">현재 지정</span>
                  <span className="text-sm font-bold">{currentFuneral}</span>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-1">
                      장례법 변경 신청
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        장례법 지정 신청
                      </DialogTitle>
                      <DialogDescription className="pl-7">
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

                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                      <Button variant="outline" className="flex-1 sm:flex-none h-9" onClick={() => setIsDialogOpen(false)}>
                        취소
                      </Button>
                      <Button className="flex-1 sm:flex-none h-9" onClick={handleFuneralSave}>
                        저장
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단: 보유 장비 현황 (좌:리스트 / 우:스케줄) */}
        <Card className="card-gov">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              보유 장비 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rentals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 왼쪽: 전체 장비 리스트 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    전체 보유 목록 ({rentals.length})
                  </h4>
                  <div className="space-y-2">
                    {rentals.map((item) => {
                      const daysLeft = item.dueDate ? differenceInDays(item.dueDate, new Date()) : 0;
                      const isOverdue = item.status === '연체' || (item.dueDate && daysLeft < 0);

                      const displayItemName = isSegwang ? redact(item.equipmentName) : item.equipmentName;
                      const displayCategory = isSegwang ? redact(item.category) : item.category;

                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-sm bg-muted/10">
                          <div className="flex items-center gap-3">
                            <Badge variant={item.category === '대여' ? 'outline' : 'secondary'} className="text-xs">
                              {displayCategory}
                            </Badge>
                            <span className="font-medium text-sm">
                              {displayItemName}
                              {(item.quantity || 1) > 1 && <span className="text-muted-foreground ml-1">(x{item.quantity})</span>}
                            </span>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-[10px]">연체 중</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 오른쪽: 반납 스케줄 */}
                <div className="space-y-3 pl-0 lg:pl-4 lg:border-l border-border">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    반납 예정 스케줄
                  </h4>
                  {returnSchedule.length > 0 ? (
                    <div className="space-y-2">
                      {returnSchedule.map((item) => {
                        const daysLeft = differenceInDays(item.dueDate!, new Date());
                        const isOverdue = daysLeft < 0;
                        const dDayClass = isOverdue
                          ? 'text-destructive font-bold'
                          : daysLeft <= 3 ? 'text-warning font-bold' : 'text-success';

                        const displaySchedName = isSegwang ? redact(item.equipmentName) : item.equipmentName;
                        const displayDate = isSegwang ? '■■■■.■■.■■' : format(new Date(item.dueDate!), 'yyyy.MM.dd', { locale: ko });
                        const displayDDay = isSegwang ? '■■' : (isOverdue ? `D+${Math.abs(daysLeft)}` : daysLeft === 0 ? 'D-Day' : `D-${daysLeft}`);

                        return (
                          <div key={`sched-${item.id}`} className="flex items-center justify-between p-3 border border-border rounded-sm">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{displaySchedName}</span>
                              <span className="text-xs text-muted-foreground">
                                반납일: {displayDate}
                              </span>
                            </div>
                            <div className={`text-sm ${dDayClass}`}>
                              {displayDDay}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-sm">
                      반납 예정인 장비가 없습니다.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                보유 중인 장비가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}

export default MyPage;
