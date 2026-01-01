import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-6xl sm:text-8xl md:text-9xl font-bold">404</h1>
        <p className="mb-4 text-lg sm:text-xl md:text-2xl text-muted-foreground">페이지를 찾을 수 없습니다</p>
        <a href="/" className="inline-block text-base sm:text-lg text-primary underline hover:text-primary/90 mt-4">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
};

export default NotFound;
