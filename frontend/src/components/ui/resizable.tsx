"use client";

import * as React from "react";
import { cn } from "./utils";

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

function ResizablePanelGroup({ className, direction = "horizontal", children, ...props }: ResizablePanelGroupProps) {
  return (
    <div
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      data-panel-group-direction={direction}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

function ResizablePanel({ className, children, defaultSize, minSize, maxSize, ...props }: ResizablePanelProps) {
  return (
    <div
      data-slot="resizable-panel"
      className={cn("relative flex-1", className)}
      style={{
        flexBasis: defaultSize ? `${defaultSize}%` : undefined,
        minWidth: minSize ? `${minSize}%` : undefined,
        maxWidth: maxSize ? `${maxSize}%` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
}

function ResizableHandle({ className, withHandle, ...props }: ResizableHandleProps) {
  return (
    <div
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <div className="h-2.5 w-1 rounded-full bg-foreground" />
        </div>
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
