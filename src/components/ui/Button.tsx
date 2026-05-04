"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
      primary: "bg-accent text-white shadow-[0_0_12px_var(--glow)] hover:shadow-[0_0_24px_var(--glow)] border border-accent/50",
      secondary: "bg-surface2 text-text border border-border hover:border-border2",
      ghost: "bg-transparent text-muted hover:text-text hover:bg-surface2",
      danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base font-bold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors font-syne focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
