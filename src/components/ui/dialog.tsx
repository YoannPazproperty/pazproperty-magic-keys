import React from "react";

// Base Dialog wrapper
export const Dialog = ({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <div data-open={open} onClick={() => onOpenChange?.(!open)}>{children}</div>
);

// Subcomponents
export const DialogContent = ({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

export const DialogHeader = ({ children }: {
  children: React.ReactNode;
}) => <header>{children}</header>;

export const DialogTitle = ({ children }: {
  children: React.ReactNode;
}) => <h2>{children}</h2>;

export const DialogDescription = ({ children }: {
  children: React.ReactNode;
}) => <p>{children}</p>;

export const DialogFooter = ({ children }: {
  children: React.ReactNode;
}) => <footer>{children}</footer>;