import React, { useEffect, useRef } from "react";
import { Button } from "./ui";

interface VideoDisplayProps {
  mediaStream: MediaStream;
  screenStream: MediaStream;
  endInterview: () => void;
  recordingDuration: number;
  setRecordingDuration: (duration: any) => void;
  isRecording: boolean;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  mediaStream,
  screenStream,
  endInterview,
  recordingDuration,
  setRecordingDuration,
  isRecording,
}) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (webcamRef.current && mediaStream) {
      webcamRef.current.srcObject = mediaStream;
    }
    if (screenRef.current && screenStream) {
      screenRef.current.srcObject = screenStream;
    }
  }, [mediaStream, screenStream]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev: any) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      setRecordingDuration(0);
    };
  }, [isRecording, setRecordingDuration]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video">
        <video
          ref={webcamRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-md h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md text-white text-xs w-12 text-center">
          {formatDuration(recordingDuration)}
        </div>
      </div>

      <div className="relative">
        <video
          ref={screenRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-md"
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-white text-xs">
          Screen Recording
        </div>
      </div>

      <Button
        text="End Interview"
        onClick={endInterview}
        color="danger"
        size="sm"
        isFullWith
      />
    </div>
  );
};

export { VideoDisplay };

