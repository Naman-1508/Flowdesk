import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  customColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", customColor, children, ...props }, ref) => {
    const variants = {
      default: "bg-surface2 text-muted border-border",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      danger: "bg-danger/10 text-danger border-danger/20",
      accent: "bg-accent/10 text-accent border-accent/20",
    };

    const style = customColor
      ? { backgroundColor: `${customColor}20`, color: customColor, borderColor: `${customColor}40` }
      : undefined;

    return (
      <span
        ref={ref}
        style={style}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wider",
          !customColor && variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
