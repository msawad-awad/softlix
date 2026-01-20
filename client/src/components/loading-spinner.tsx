import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({ className, size = "default" }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
}
