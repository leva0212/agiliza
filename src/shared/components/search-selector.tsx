"use client";

import { Search } from "lucide-react";

type SearchSelectorProps = {
  label: string;

  valueName: string;

  placeholder: string;

  onSearch: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function SearchSelector({
  label,

  valueName,

  placeholder,

  onSearch,
  disabled = false,
  compact = false,
}: SearchSelectorProps) {
  return (
    <div
      className={`w-full ${compact ? "max-w-[260px]" : "max-w-[400px]"}`}
    >
      <label
        className={compact ? "sr-only" : "mb-1 block text-sm font-medium"}
      >
        {label}
      </label>

      <div className="relative">
        <input
          readOnly
          value={valueName}
          placeholder={placeholder}
          className={`input-has-trailing-icon
  w-full
  border
  rounded-lg
  ${compact ? "h-9 p-2 text-sm" : "p-3"}
  pr-12

  ${disabled ? "bg-gray-100 text-gray-400" : "bg-white"}
`}
        />

        <button
          disabled={disabled}
          type="button"
          onClick={onSearch}
          className={`
  absolute
  right-2
  top-1/2
  -translate-y-1/2
  flex
  size-9
  items-center
  justify-center
  rounded-md

  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50 dark:hover:bg-slate-700"}
`}
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
