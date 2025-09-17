"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple tooltip implementation without Radix UI
interface TooltipProviderProps {
  children: React.ReactNode;
}

// Implementação mais simples sem hooks para evitar conflitos
const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return React.createElement(React.Fragment, null, children);
};

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const TooltipTrigger = ({ children, className, ...props }: TooltipTriggerProps) => {
  return (
    <div className={cn("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
};
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}

const TooltipContent = ({ children, className, sideOffset = 4, ...props }: TooltipContentProps) => {
  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        "opacity-0 pointer-events-none transition-opacity duration-200",
        "group-hover:opacity-100 group-hover:pointer-events-auto",
        className
      )}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      {...props}
    >
      {children}
    </div>
  );
};
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };