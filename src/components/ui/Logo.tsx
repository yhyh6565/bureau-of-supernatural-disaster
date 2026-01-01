export function Logo({
    className = "w-full h-full",
    bgClass = "bg-white",
    circleColor = "#F4F4F4",
    blueColor = "#2c5598",
    redColor = "#c02626"
}: {
    className?: string;
    bgClass?: string;
    circleColor?: string;
    blueColor?: string;
    redColor?: string;
}) {
    return (
        <div className={`${className} rounded-full ${bgClass} flex items-center justify-center shadow-sm overflow-hidden`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="50" fill={circleColor} />
                <path d="M50,50 A25,25 0 0,1 50,0 A50,50 0 0,0 50,100 A25,25 0 0,0 50,50 Z" fill={blueColor} />
                <path d="M50,50 A25,25 0 0,0 50,0 A50,50 0 0,1 50,100 A25,25 0 0,1 50,50 Z" fill={redColor} />
            </svg>
        </div>
    );
}
