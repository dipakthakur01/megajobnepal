"use client";

import * as React from "react";
import { cn } from "./utils";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  pressed,
  onPressedChange,
  children,
  onClick,
  ...props
}: ToggleProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-transparent",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizeClasses = {
    default: "h-10 px-3",
    sm: "h-9 px-2.5",
    lg: "h-11 px-5",
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onPressedChange) {
      onPressedChange(!pressed);
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        pressed && "bg-accent text-accent-foreground",
        className,
      )}
      aria-pressed={pressed}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export { Toggle };
