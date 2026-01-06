import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { GlitchWrapper } from "./GlitchWrapper";

interface ExitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitConfirmModal({ isOpen, onClose, onConfirm }: ExitConfirmModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-black border-red-900 text-red-500 font-mono max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                        <GlitchWrapper intensity="medium">
                            ▶ SYSTEM DISCONNECT
                        </GlitchWrapper>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-red-400/80">
                        연결을 종료하시겠습니까?
                        <br />
                        <br />
                        <span className="text-xs text-red-600 block mt-2">
                            * 경고: 현재 세션이 종료되면 이 데이터를 다시 복구할 수 없을지도 모릅니다.
                            <br />
                            * 마지막 백업: 20██.05.04 23:47:00
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onClose}
                        className="bg-transparent border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400"
                    >
                        취소 (머무르기)
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-900 text-white hover:bg-red-800 border-none animate-pulse"
                    >
                        접속 종료
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
