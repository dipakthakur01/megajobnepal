"use client";

import * as React from "react";
import { cn } from "./utils";

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

function ToggleGroup({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  type = "single",
  value,
  onValueChange,
  ...props 
}: ToggleGroupProps) {
  return (
    <div
      data-slot="toggle-group"
      className={cn(
        "flex items-center justify-center gap-1",
        className,
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}

interface ToggleGroupItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function ToggleGroupItem({ 
  className, 
  variant = "default", 
  size = "default", 
  value,
  pressed,
  onPressedChange,
  children,
  ...props 
}: ToggleGroupItemProps) {
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

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        pressed && "bg-accent text-accent-foreground",
        className,
      )}
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
