import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-surface2 relative overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";
