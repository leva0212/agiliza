"use client";

type SearchSelectorProps = {
  label: string;

  valueName: string;

  placeholder: string;

  onSearch: () => void;
  disabled?: boolean;
};

export function SearchSelector({
  label,

  valueName,

  placeholder,

  onSearch,
  disabled = false,
}: SearchSelectorProps) {
  return (
    <div
      className="
        w-full
        max-w-[400px]
      "
    >
      <label
        className="
          block
          text-sm
          font-medium
          mb-1
        "
      >
        {label}
      </label>

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <input
          readOnly
          value={valueName}
          placeholder={placeholder}
          className={`
  flex-1
  border
  rounded-lg
  p-3

  ${disabled ? "bg-gray-100 text-gray-400" : "bg-white"}
`}
        />

        <button
          disabled={disabled}
          type="button"
          onClick={onSearch}
          className={`
  px-4
  border
  rounded-lg

  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}
`}
        >
          🔍
        </button>
      </div>
    </div>
  );
}
