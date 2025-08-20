interface HeadingProps {
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  titleClass?: string;
  size?: "sm" | "md" | "lg";
}

const Heading = ({
  title,
  icon,
  className,
  titleClass,
  size = "md",
}: HeadingProps) => {
  const sizeClass =
    size === "sm"
      ? "text-base 2xl:text-lg"
      : size === "md"
      ? "text-lg 2xl:text-xl"
      : "text-xl 2xl:text-2xl";
  return (
    <div className={`flex items-center gap-2 text-gray-800 ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <h2 className={`${sizeClass} font-semibold ${titleClass}`}>{title}</h2>
    </div>
  );
};

export { Heading };
