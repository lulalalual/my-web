import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type LiquidGlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function LiquidGlassPanel({
  children,
  className,
  ...props
}: LiquidGlassPanelProps) {
  return (
    <div
      className={clsx(
        "rounded-[2rem] border border-white/60 bg-white/45 shadow-[var(--shadow)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
