"use client";

import * as React from "react";
import { cn } from "./utils";

interface DrawerProps {
  children?: React.ReactNode;
}

function Drawer({ children, ...props }: DrawerProps) {
  return (
    <div data-slot="drawer" {...props}>
      {children}
    </div>
  );
}

function DrawerTrigger({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button data-slot="drawer-trigger" {...props}>
      {children}
    </button>
  );
}

function DrawerPortal({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="drawer-portal" {...props}>
      {children}
    </div>
  );
}

function DrawerClose({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button data-slot="drawer-close" {...props}>
      {children}
    </button>
  );
}

function DrawerOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-overlay"
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-content"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </div>
  );
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="drawer-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
