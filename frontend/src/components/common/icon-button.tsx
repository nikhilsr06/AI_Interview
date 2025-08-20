interface IconButtonProps {
  onClick: () => void;
  icon: any;
  color?: "primary" | "red" | "green" | "yellow" | "blue";
  disabled?: boolean;
  padding?: string;
  className?: string;
}
const IconButton = ({
  onClick,
  icon,
  color = "primary",
  disabled = false,
  padding,
  className,
}: IconButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };
  const colorClass = {
    primary: "bg-indigo-50 text-indigo-500 hover:bg-indigo-200 active:scale-95",
    red: "bg-red-50 text-red-500 hover:bg-red-200 active:scale-95",
    green: "bg-green-50 text-green-500 hover:bg-green-200 active:scale-95",
    yellow: "bg-yellow-50 text-yellow-500 hover:bg-yellow-200 active:scale-95",
    blue: "bg-blue-50 text-blue-500 hover:bg-blue-200 active:scale-95",
  };
  return (
    <button
      className={`cursor-pointer bg-transparent font-medium ${
        colorClass[color]
      } rounded-md active:scale-95 transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${padding ? padding : "p-1.5"} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};

export { IconButton };
