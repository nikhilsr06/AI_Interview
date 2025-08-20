import { AiOutlineLoading3Quarters } from "react-icons/ai";

type ButtonVariant = "contained" | "outlined" | "text";
type ButtonSize = "sm" | "md" | "lg";
type ButtonColor =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "info"
  | "success";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  text: string;
  className?: string;
  before?: any;
  after?: any;
  loading?: boolean;
  disabled?: boolean;
  isFullWith?: boolean;
  onClick?: () => void;
}

const Button = ({
  variant = "contained",
  size = "md",
  color = "primary",
  text,
  className = "",
  after,
  disabled = false,
  isFullWith = false,
  before,
  loading,
  onClick,
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border border-[1px] ";

  const colorStyles: Record<
    ButtonColor,
    {
      base: string;
      outlined: string;
      text: string;
    }
  > = {
    primary: {
      base: "bg-indigo-500 text-white hover:bg-indigo-600",
      outlined: "border-indigo-500 text-indigo-500 hover:bg-indigo-50",
      text: "text-indigo-500 hover:bg-indigo-50",
    },
    secondary: {
      base: "bg-gray-500 text-white hover:bg-gray-600",
      outlined: "border-gray-500 text-gray-500 hover:bg-gray-50",
      text: "text-gray-500 hover:bg-gray-50",
    },
    success: {
      base: "bg-green-500 text-white hover:bg-green-600",
      outlined: "border-green-500 text-green-500 hover:bg-green-50",
      text: "text-green-500 hover:bg-green-50",
    },
    danger: {
      base: "bg-red-500 text-white hover:bg-red-600",
      outlined: "border-red-500 text-red-500 hover:bg-red-50",
      text: "text-red-500 hover:bg-red-50",
    },
    warning: {
      base: "bg-yellow-500 text-white hover:bg-yellow-600",
      outlined: "border-yellow-500 text-yellow-500 hover:bg-yellow-50",
      text: "text-yellow-500 hover:bg-yellow-50",
    },
    info: {
      base: "bg-blue-500 text-white hover:bg-blue-600",
      outlined: "border-blue-500 text-blue-500 hover:bg-blue-50",
      text: "text-blue-500 hover:bg-blue-50",
    },
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs 2xl:h-9 2xl:px-4 2xl:text-sm",
    md: "h-10 px-4 text-base 2xl:h-11 2xl:px-5 2xl:text-lg",
    lg: "h-12 px-6 text-lg 2xl:h-14 2xl:px-7 2xl:text-xl",
  };

  const getVariantStyles = (variant: ButtonVariant, color: ButtonColor) => {
    switch (variant) {
      case "contained":
        return `${colorStyles[color].base} border-transparent shadow`;
      case "outlined":
        return `${colorStyles[color].outlined} border-2 bg-transparent`;
      case "text":
        return `${colorStyles[color].text} bg-transparent`;
    }
  };

  const disableColor = disabled
    ? "pointer-events-none disabled:opacity-50"
    : "cursor-pointer";

  const fullWidth = isFullWith ? "w-full" : "w-fit";

  const buttonClasses = `
      ${baseStyles}
      ${getVariantStyles(variant, color)}
      ${sizeStyles[size]} 
      ${fullWidth}
      ${disableColor}
      ${className}
    `.trim();

  return (
    <button className={buttonClasses} disabled={disabled} onClick={onClick}>
      {loading && (
        <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!loading && before && <span className="mr-2">{before}</span>}
      {text}
      {!loading && after && <span className="ml-2">{before}</span>}
    </button>
  );
};

export { Button };
