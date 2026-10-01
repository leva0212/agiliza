"use client";

import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type FilterSearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  helpText: string;
};

export function FilterSearchInput({
  helpText,
  className = "",
  ...props
}: FilterSearchInputProps) {
  return (
    <div className="relative" title={helpText}>
      <Search
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        {...props}
        type={props.type ?? "search"}
        title={helpText}
        className={`w-full pl-10 ${className}`}
      />
    </div>
  );
}
