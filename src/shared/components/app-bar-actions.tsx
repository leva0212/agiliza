"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ActionsProps = { children: ReactNode };
type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "danger";
};
type ActionLinkProps = {
  href: string;
  label: string;
  children: ReactNode;
  tone?: ActionButtonProps["tone"];
};

const toneClasses = {
  neutral: "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
  primary: "border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500",
  success: "border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  danger: "border-red-200 bg-white/80 text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-800/90 dark:text-red-300 dark:hover:bg-red-950/60",
};

function Tooltip({ label }: { label: string }) {
  return (
    <span role="tooltip" className="pointer-events-none absolute right-0 top-full z-[80] mt-2 hidden whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block group-focus-within:block dark:bg-white dark:text-slate-950">
      {label}
    </span>
  );
}

export function AppBarActions({ children }: ActionsProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("dashboard-appbar-actions"));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}

export function AppBarActionButton({
  label,
  children,
  tone = "neutral",
  className = "",
  ...props
}: ActionButtonProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        title={label}
        className={`flex size-10 items-center justify-center rounded-xl border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${toneClasses[tone]} ${className}`}
        {...props}
      >
        {children}
      </button>
      <Tooltip label={label} />
    </span>
  );
}

export function AppBarActionLink({ href, label, children, tone = "primary" }: ActionLinkProps) {
  return (
    <span className="group relative inline-flex">
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={`flex size-10 items-center justify-center rounded-xl border shadow-sm transition ${toneClasses[tone]}`}
      >
        {children}
      </Link>
      <Tooltip label={label} />
    </span>
  );
}