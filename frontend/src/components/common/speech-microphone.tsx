import { useEffect, useState } from "react";
import { PiMicrophone } from "react-icons/pi";

const SpeechMicrophone = ({ transcript }: { transcript: string }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (transcript.trim()) {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 1000);
    }
  }, [transcript]);

  return (
    <div className="relative flex items-center justify-center">
      <PiMicrophone className="w-8 h-8 rounded-full text-red-400 transition-all duration-300 hover:scale-105" />
      <div
        className={`absolute top-1/2 -z-10 -translate-y-1/2 w-12 h-12 rounded-full bg-indigo-100 opacity-60 ${
          isSpeaking ? "animate-ping" : ""
        }`}
      />
      <div className="absolute top-1/2 -z-10 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-200 opacity-50"></div>
    </div>
  );
};

export { SpeechMicrophone };
