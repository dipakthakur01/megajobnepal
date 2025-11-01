"use client";

import * as React from "react";
import { cn } from "./utils";

interface HoverCardProps {
  children?: React.ReactNode;
}

function HoverCard({ children, ...props }: HoverCardProps) {
  return (
    <div data-slot="hover-card" {...props}>
      {children}
    </div>
  );
}

function HoverCardTrigger({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="hover-card-trigger" {...props}>
      {children}
    </div>
  );
}

function HoverCardContent({ className, align = "center", sideOffset = 4, children, ...props }: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <div
      data-slot="hover-card-content"
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
