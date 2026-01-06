import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export function SegwangTimelineLog() {
    const logs = [
        { time: "19:47", message: "구시가지에서 최초 이상현상 발생", type: "warning" },
        { time: "20:22", message: "시내 전역으로 이상현상 확산 (47건 신고)", type: "warning" },
        { time: "20:47", message: "현장 출동, 미확인 현상 확인", type: "info" },
        { time: "21:30", message: "멸형급 재난으로 판단, 비상소집", type: "danger" },
        { time: "22:34", message: "지하철 순환선 7개 역을 임시 대피소로 지정", type: "info" },
        { time: "22:47", message: "지상 포기, 지하 대피로 전환", type: "danger" },
        { time: "22:58", message: "서울 본부 통신 두절", type: "critical" },
        { time: "23:31", message: "지하철역들이 재난으로 변이 시작", type: "critical" },
        { time: "23:42", message: "전 요원 철수 명령", type: "critical" },
        { time: "23:47", message: "마지막 기록 및 자동 백업", type: "system" },
    ];

    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        if (visibleCount < logs.length) {
            const timeout = setTimeout(() => {
                setVisibleCount(prev => prev + 1);
            }, 150); // Typing effect speed
            return () => clearTimeout(timeout);
        }
    }, [visibleCount]);

    return (
        <Card className="bg-black/95 border-red-900/50 shadow-lg shadow-red-900/10">
            <CardHeader className="border-b border-red-900/30 py-3">
                <CardTitle className="text-sm font-mono text-red-500 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    SYSTEM_RECOVERY_LOG
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-xs space-y-2 h-[300px] overflow-y-auto custom-scrollbar">
                {logs.slice(0, visibleCount).map((log, index) => (
                    <div key={index} className={`flex gap-3 ${log.type === 'critical' ? 'text-red-500 font-bold' :
                            log.type === 'danger' ? 'text-red-400' :
                                log.type === 'warning' ? 'text-yellow-600/80' :
                                    log.type === 'system' ? 'text-green-500' :
                                        'text-gray-400'
                        }`}>
                        <span className="opacity-50 shrink-0">[{log.time}]</span>
                        <span>{log.message}</span>
                    </div>
                ))}
                {visibleCount < logs.length && (
                    <div className="animate-pulse text-red-500">_</div>
                )}
            </CardContent>
        </Card>
    );
}
