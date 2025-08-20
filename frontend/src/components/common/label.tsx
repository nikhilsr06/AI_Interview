interface LabelProps {
  text: string;
  htmlFor?: string;
  className?: string;
  required?: boolean;
  onClick?: () => void;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
  ariaLabel?: string;
}

const Label = ({
  text,
  htmlFor,
  className,
  required,
  onClick,
  isDisabled,
  size = "md",
  color = "text-gray-700",
  ariaLabel,
}: LabelProps) => {
  const sizeStyles = {
    sm: "text-xs 2xl:text-sm",
    md: "text-sm 2xl:text-base",
    lg: "text-lg 2xl:text-xl",
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`block font-medium ${sizeStyles[size]} ${
        isDisabled ? "text-gray-400" : color
      } ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export { Label };
