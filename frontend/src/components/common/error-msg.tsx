const ErrorMsg = ({ text }: { text: string }) => {
  return (
    <span
      id={text}
      aria-label="error message"
      className="block fs-10 2xl:text-xs text-red-500"
    >
      {text}
    </span>
  );
};

export { ErrorMsg };
