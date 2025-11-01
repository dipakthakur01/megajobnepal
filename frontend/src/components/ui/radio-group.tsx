"use client";

import * as React from "react";
import { cn } from "./utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

function RadioGroup({ className, children, value, onValueChange, ...props }: RadioGroupProps) {
  return (
    <div
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      role="radiogroup"
      {...props}
    >
      {children}
    </div>
  );
}

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function RadioGroupItem({ className, value, checked, onCheckedChange, ...props }: RadioGroupItemProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      )}
    </button>
  );
}

export { RadioGroup, RadioGroupItem };
