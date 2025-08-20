interface TextAreaProps {
  id?: string;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
}

const TextArea = ({
  id,
  label,
  error,
  helperText,
  fullWidth = false,
  className = "",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  rows = 4,
}: TextAreaProps) => {
  const errorStyles = error
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300";

  const widthStyles = fullWidth ? "w-full" : "w-auto";

  return (
    <div
      className={`flex flex-col text-sm 2xl:text-sm rounded-md border border-gray-200 ${widthStyles} ${className} overflow-y-auto`}
    >
      {label && (
        <label
          htmlFor={id}
          className="block font-medium text-gray-700 mb-1.5 2xl:mb-3"
        >
          {label}
        </label>
      )}

      <textarea
        className={`w-full min-h-[80px] px-3  py-2  border rounded-md border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${errorStyles} ${className}`}
        name={id}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
      />

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export { TextArea };
