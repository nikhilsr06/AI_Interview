interface CountdownTimerProps {
  totalTime: number;
  timeLeft: number;
}
const CountdownTimer = ({ totalTime, timeLeft }: CountdownTimerProps) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - timeLeft / totalTime);

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          className="stroke-current text-blue-100"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          className={`stroke-current ${
            timeLeft < 10 ? "text-red-500" : "text-blue-500"
          } transition-colors duration-300`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="fs-10 2xl:text-xs font-medium">{timeLeft}</span>
      </div>
    </div>
  );
};

export { CountdownTimer };
