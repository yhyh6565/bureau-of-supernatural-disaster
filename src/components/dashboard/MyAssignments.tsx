import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO, DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { DataManager } from '@/data/dataManager';
import { ClipboardList, ArrowRight, FileSearch, Truck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyAssignments() {
  const { agent } = useAuth();
  const navigate = useNavigate();

  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];
  const incidents = DataManager.getIncidents(agent);

  // 부서별 할당 업무 필터링
  const getMyIncidents = () => {
    switch (department) {
      case 'baekho':
        return incidents.filter(inc =>
          inc.status === '접수' || inc.status === '조사중'
        ).slice(0, 3);
      case 'hyunmu':
        return incidents.filter(inc =>
          inc.status === '구조대기' || inc.status === '구조중'
        ).slice(0, 3);
      case 'jujak':
        return incidents.filter(inc =>
          inc.status === '정리대기' || inc.status === '정리중'
        ).slice(0, 3);
      default:
        return [];
    }
  };

  const myIncidents = getMyIncidents();

  const getActionLabel = () => {
    switch (department) {
      case 'baekho': return '조사 시작';
      case 'hyunmu': return '출동 승낙';
      case 'jujak': return '정리 시작';
      default: return '상세 보기';
    }
  };

  const getDeptIcon = () => {
    switch (department) {
      case 'baekho': return FileSearch;
      case 'hyunmu': return Truck;
      case 'jujak': return Sparkles;
      default: return ClipboardList;
    }
  };

  const DeptIcon = getDeptIcon();

  return (
    <Card className="card-gov">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base font-medium flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <DeptIcon className="w-4 h-4" />
            나의 배정 업무
          </div>
          <span className={`text-xs sm:text-sm px-2 py-0.5 rounded flex items-center gap-1.5 sm:ml-auto ${deptInfo.bgClassLight} ${deptInfo.textClass}`}>
            <deptInfo.icon className="w-3.5 h-3.5" /> {deptInfo.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myIncidents.length > 0 ? (
          <div className="space-y-3">
            {myIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 border border-border rounded-sm hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* 상단: 상태, 등급 뱃지 */}
                    <div className="flex items-center gap-1.5">
                      <Badge className={`${STATUS_STYLE[incident.status].bgClass} ${STATUS_STYLE[incident.status].textClass} text-[10px] px-1.5 h-5`}>
                        {incident.status}
                      </Badge>
                      <Badge className={`${DANGER_LEVEL_STYLE[incident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[incident.dangerLevel].textClass} text-[10px] px-1.5 h-5`}>
                        {incident.dangerLevel}
                      </Badge>
                    </div>

                    {/* 중단: 제목 및 위치 */}
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-sm leading-tight truncate">
                        {incident.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {incident.location}
                      </p>
                    </div>
                  </div>

                  {/* 우측: 액션 버튼 */}
                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs shrink-0 flex flex-col items-center justify-center gap-0.5"
                    onClick={() => navigate('/tasks')}
                  >
                    <span>{getActionLabel().split(' ')[0]}</span>
                    <span>{getActionLabel().split(' ')[1]}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">현재 배정된 업무가 없습니다.</p>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full mt-2 text-xs text-muted-foreground h-8"
          onClick={() => navigate('/tasks')}
        >
          담당업무 전체 보기
        </Button>
      </CardContent>
    </Card>
  );
}
