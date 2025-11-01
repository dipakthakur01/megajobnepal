"use client";

import * as React from "react";
import { cn } from "./utils";

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

function TooltipProvider({ children, delayDuration = 0 }: TooltipProviderProps) {
  return <div data-tooltip-provider>{children}</div>;
}

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Tooltip({ children, open, onOpenChange }: TooltipProps) {
  return <div data-tooltip>{children}</div>;
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

function TooltipTrigger({ children, asChild, ...props }: TooltipTriggerProps) {
  return (
    <div data-tooltip-trigger {...props}>
      {children}
    </div>
  );
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

function TooltipContent({
  className,
  children,
  side = "top",
  align = "center",
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  return (
    <div
      data-tooltip-content
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
