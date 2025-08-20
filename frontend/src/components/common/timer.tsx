interface TimerProps {
  ElapsedTime: number;
}

const Timer = ({ ElapsedTime }: TimerProps) => {
  function FormatTime() {
    let Hours: string = Math.floor(ElapsedTime / (1000 * 60 * 60)).toString();
    let Minutes: string = Math.floor(
      (ElapsedTime / (1000 * 60)) % 60
    ).toString();
    let Seconds: string = Math.floor((ElapsedTime / 1000) % 60).toString();
    // let Miliseconds: string = Math.floor((ElapsedTime % 1000) / 10).toString();

    Hours = String(Hours).padStart(2, "0");
    Minutes = String(Minutes).padStart(2, "0");
    Seconds = String(Seconds).padStart(2, "0");

    return (
      <div className="text-base 2xl:text-lg text-white font-semibold flex justify-center items-end gap-1">
        <div className="w-8 flex justify-center gap-0.5 items-baseline">
          {Minutes} <span className="fs-10">M</span>
        </div>
        <div className="w-8 flex justify-center gap-0.5 items-baseline">
          {Seconds} <span className="fs-10">S</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center rounded-md bg-indigo-500 p-2">
      {FormatTime()}
    </div>
  );
};

export { Timer };
