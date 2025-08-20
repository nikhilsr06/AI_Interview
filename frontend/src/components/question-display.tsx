import { useEffect, useState, useRef } from "react";
import { BsSkipForward } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import {
  Heading,
  IconButton,
  Label,
  SpeechMicrophone,
} from "./common";
import { Answer, Question } from "./interfaces";
import { Button, Dropdown, TextArea } from "./ui";

interface QuestionDisplayProps {
  question: Question;
  onAnswerSubmit: (answer: Answer) => void;
  transcript: string;
  timeLeft: number;
  skipQuestion: () => void;
  totalTime: number;
  stopListening: () => void;
  startListening: () => void;
  resetTranscript: () => void;
  listening: boolean;
}

const QuestionDisplay = ({
  question,
  onAnswerSubmit,
  transcript,
  timeLeft,
  skipQuestion,
  totalTime,
  stopListening,
  startListening,
  resetTranscript,
  listening,
}: QuestionDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(transcript);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // --- Local countdown timer logic with animation ---
  const [localTimeLeft, setLocalTimeLeft] = useState(totalTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditedAnswer(transcript);
  }, [transcript]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakText = (text: string) => {
    if (!text) return;

    const speech = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) speech.voice = voice;

    stopListening();

    speech.onend = () => {
      startListening();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    speakText(question.text);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [question.text, selectedVoice, voices]);

  const handleSubmit = () => {
    onAnswerSubmit({
      id: question.id,
      text: editedAnswer,
    });
    setIsEditing(false);
    setEditedAnswer("");
  };

  useEffect(() => {
    setLocalTimeLeft(totalTime);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLocalTimeLeft((prev) => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id, totalTime]);

  useEffect(() => {
    if (localTimeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [localTimeLeft]);

  // Animated progress bar width (from 100% to 0%)
  const progressPercent = Math.max(0, (localTimeLeft / totalTime) * 100);

  // Disk (circular) timer calculation
  const radius = 24; // Increased size
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = circumference * (1 - localTimeLeft / totalTime);

  return (
    <div className="p-4 bg-white rounded-md h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <Heading title={`Question - ${question.id}`} /> */}
          <Heading title={`Question - ${question.number}`} />
          <div className="w-72">
            <Dropdown
              options={voices.map((voice, index) => ({
                value: voice.name,
                label: `Voice : ${index + 1}`,
              }))}
              value={selectedVoice}
              onChange={(option) => setSelectedVoice(option.value)}
            />
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[90px]">
          {/* Disk timer */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg
              width={radius * 2}
              height={radius * 2}
              style={{ transform: "rotate(90deg) scale(-1,1)" }} // Flip animation direction, start from top
            >
              <circle
                stroke="#e5e7eb"
                fill="none"
                strokeWidth={stroke}
                cx={radius}
                cy={radius}
                r={normalizedRadius}
              />
              <circle
                stroke="#6366f1"
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                style={{
                  transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)"
                }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-base">
              {localTimeLeft}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 my-1">
        <Label text={question.text} ariaLabel="question-text" />
        <IconButton
          icon={<HiOutlineSpeakerWave className="w-4 h-4" />}
          onClick={() => speakText(question.text)}
        />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <TextArea
            value={isEditing ? editedAnswer : transcript}
            onChange={(e) => setEditedAnswer(e.target.value)}
            disabled={!isEditing}
            placeholder="Your answer will appear here as you speak..."
            rows={9}
          />
          {listening && !isEditing && (
            <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-4">
              <SpeechMicrophone transcript={transcript} />{" "}
              {listening && (
                <span className="text-xs text-indigo-500">
                  Hey, I'm listening...
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between space-x-4">
          <Button
            onClick={() => setIsEditing(true)}
            text="Edit Answer"
            disabled={isEditing}
            variant="outlined"
            color="secondary"
            size="sm"
          />
          <div className="flex items-center gap-4">
            <Button
              onClick={skipQuestion}
              text="Skip Question"
              before={<BsSkipForward className="w-3 h-3" />}
              variant="outlined"
              color="secondary"
              size="sm"
            />
            <Button size="sm" onClick={handleSubmit} text="Save Answer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { QuestionDisplay };
