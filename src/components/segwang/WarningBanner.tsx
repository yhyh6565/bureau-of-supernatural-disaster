import { AlertTriangle } from "lucide-react";
import { GlitchWrapper } from "./GlitchWrapper";

export function WarningBanner() {
    return (
        <div className="w-full bg-red-950/80 border-b border-red-500 text-red-500 overflow-hidden relative h-10 flex items-center">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap px-4 font-mono font-bold w-full justify-center">
                <GlitchWrapper intensity="medium">
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        WARNING: EXTERNAL NETWORK DISCONNECTED
                    </span>
                </GlitchWrapper>
                <span className="opacity-50 mx-4">|</span>
                <GlitchWrapper intensity="high">
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        SYSTEM ERROR: DATA CORRUPTION DETECTED
                    </span>
                </GlitchWrapper>
                <span className="opacity-50 mx-4">|</span>
                <GlitchWrapper intensity="low">
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        UNAUTHORIZED ACCESS
                    </span>
                </GlitchWrapper>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-scanlines opacity-20"></div>
        </div>
    );
}
