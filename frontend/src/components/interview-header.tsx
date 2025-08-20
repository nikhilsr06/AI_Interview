import { ScreenitLogo } from "../assets";
import { Heading, Label } from "./common";

interface InterviewHeaderProps {
  data: {
    title: string;
    // organization: string;
    round: number;
    duration: number;
  };  
}

const InterviewHeader = ({ data }: InterviewHeaderProps) => {

  // const secondsToMinutes = (seconds:number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  // }

  return (
    <header className="rounded-md p-4 bg-white grid grid-cols-6 gap-4 w-full">
      <div className="flex justify-center items-center">
        <div className="h-12 w-24">
          <img
            className="h-full w-full"
            src={ScreenitLogo}
            alt="screenit logo"
            loading="lazy"
          />
        </div>
      </div>
      <div className="bg-gray-100 rounded-md p-4 flex flex-col items-center justify-center col-span-5">
        <Heading
          // title={`${data.organization} - ${data.title} Interview - Round ${data.round}`}
          title={`${data.title} Interview - Round ${data.round}`}
          
          className="text-center"
        />
        <Label
          // text={`Duration: ${secondsToMinutes(data.duration)} minutes`}
          text={`Duration: ${data.duration} minutes`}
          size="sm"
          color="text-gray-500"
          className="text-center"
        />
      </div>
    </header>
  );
};

export { InterviewHeader };
