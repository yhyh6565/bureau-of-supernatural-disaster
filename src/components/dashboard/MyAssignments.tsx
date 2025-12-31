import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/types/haetae';
import { MOCK_INCIDENTS } from '@/data/mockData';
import { ClipboardList, ArrowRight, FileSearch, Truck, Sparkles } from 'lucide-react';

export function MyAssignments() {
  const { agent } = useAuth();
  
  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];

  // 부서별 할당 업무 필터링
  const getMyIncidents = () => {
    switch (department) {
      case 'baekho':
        return MOCK_INCIDENTS.filter(inc => 
          inc.status === '접수' || inc.status === '조사중'
        ).slice(0, 3);
      case 'hyunmu':
        return MOCK_INCIDENTS.filter(inc => 
          inc.status === '구조대기' || inc.status === '구조중'
        ).slice(0, 3);
      case 'jujak':
        return MOCK_INCIDENTS.filter(inc => 
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <DeptIcon className="w-4 h-4" />
          나의 배정 업무
          <span className={`ml-auto text-sm px-2 py-0.5 rounded bg-${deptInfo.colorClass}/10 text-${deptInfo.colorClass}`}>
            {deptInfo.icon} {deptInfo.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myIncidents.length > 0 ? (
          <div className="space-y-2">
            {myIncidents.map((incident) => (
              <div 
                key={incident.id}
                className="p-3 border border-border rounded-sm hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {incident.caseNumber}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    {getActionLabel()}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm truncate">{incident.location}</p>
                {incident.darknessType && (
                  <span className="text-xs text-abyssal">
                    어둠: {incident.darknessType}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">현재 배정된 업무가 없습니다.</p>
          </div>
        )}

        <Button variant="outline" className="w-full mt-3" size="sm">
          담당업무 전체 보기
        </Button>
      </CardContent>
    </Card>
  );
}
