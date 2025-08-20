import { useCallback, useEffect, useRef, useState } from "react";
import { BiCamera } from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import PdfUpload from "./components/PdfUpload";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import {
  Answer,
  AnswerReview,
  Button,
  Heading,
  Label,
  PermissionHandler,
  QuestionDisplay,
  RecordingState,
  VideoDisplay,
} from "./components";
import { InterviewHeader } from "./components/interview-header";

const DEFAULT_TIME = 30;
function App() {
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [title, setTitle] = useState<string>("");
  const [scheduleID, setScheduleID] = useState<string>("");


  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }
  }, []);
  

  const [recordingState, setRecordingState] = useState<RecordingState>({
    hasAudioPermission: false,
    hasVideoPermission: false,
    hasScreenPermission: false,
    isRecording: false,
    currentError: null,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    questions[currentQuestionIndex]?.timeToAnswer ||
      DEFAULT_TIME
  );
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any | null>(null);
  // const [eyeNotDetected, setEyeNotDetected] = useState(false);
  // const alertShownRef = useRef(false);
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const handlePdfUpload = (
      title: string,
      timeLimit: number,
      questionsFromBackend: any[],
      schedule_id: string
    ) => {
      setTitle(title);
      setScheduleID(schedule_id);
      setTimeLimit(timeLimit);
      setQuestions(
        questionsFromBackend.map((q, idx) => ({
          number: idx + 1, // q-number
          id: q.question_id,
          text: q.question,
          timeToAnswer: q.timetoanswer,
          difficulty: q.difficulty,
        }))
      );
      setPdfUploaded(true);
    };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (
      !recordingState.isRecording ||
      showReview ||
      currentQuestionIndex >= questions.length
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime: number) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleAnswerSubmit({
            id: questions[currentQuestionIndex]?.id,
            text: transcript || "Time expired",
          });

          if (
            currentQuestionIndex >=
            questions.length - 1
          ) {
            endInterview();
            setShowReview(true);
          }

          return (
            questions[currentQuestionIndex].timeToAnswer ||
            DEFAULT_TIME
          );
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    recordingState.isRecording,
    currentQuestionIndex,
    transcript,
    questions.length,
  ]);

  useEffect(() => {
    if (currentQuestionIndex > 0) {
      resetTranscript();
      startListening();
    }
  }, [currentQuestionIndex]);



  const monitorPermissions = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.onended = () => {
          setRecordingState((prev) => ({
            ...prev,
            hasAudioPermission: false,
            hasVideoPermission: false,
            isRecording: false,
            currentError: "Audio/Video permissions were revoked",
          }));
          endInterview();
        };
      });
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.onended = () => {
          setRecordingState((prev) => ({
            ...prev,
            hasScreenPermission: false,
            isRecording: false,
            currentError: "Screen sharing was stopped",
          }));
          endInterview();
        };
      });
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      mediaStreamRef.current = stream;
      setRecordingState((prev) => ({
        ...prev,
        hasAudioPermission: true,
        hasVideoPermission: true,
      }));

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack.getSettings().displaySurface !== "monitor") {
        throw new Error("Please select entire screen for recording");
      }

      screenStreamRef.current = screenStream;
      setRecordingState((prev) => ({
        ...prev,
        hasScreenPermission: true,
        currentError: null,
      }));

      monitorPermissions();
    } catch (error) {
      setRecordingState((prev) => ({
        ...prev,
        currentError:
          error instanceof Error ? error.message : "Permission denied",
      }));

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
    }
  }, [monitorPermissions]);

  const handleAnswerSubmit = (answer: Answer) => {
    setAnswers((prev) => [...prev, answer]);
    if (currentQuestionIndex >= questions.length - 1) {
      endInterview();
      setShowReview(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(
        questions[currentQuestionIndex].timeToAnswer ||
          DEFAULT_TIME
      );
    }
  };

  const skipQuestion = () => {
    handleAnswerSubmit({
      id: questions[currentQuestionIndex].id,
      text: transcript || "Question skipped",
    });
    stopListening();
    resetTranscript();
  };

  const startRecording = useCallback(() => {
    if (
      recordingState.hasAudioPermission &&
      recordingState.hasVideoPermission &&
      recordingState.hasScreenPermission
    ) {
      // startListening();
      setTimeLeft(
        questions[currentQuestionIndex].timeToAnswer ||
          DEFAULT_TIME
      );
      setRecordingState((prev) => ({ ...prev, isRecording: true }));
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Failed to start speech recognition:", error);
          setRecordingState((prev) => ({
            ...prev,
            currentError: "Failed to start speech recognition",
          }));
        }
      }
    }
  }, [recordingState]);

  const endInterview = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecordingState((prev) => ({ ...prev, isRecording: false }));
    setTimeLeft(DEFAULT_TIME);
    setShowReview(true);
    stopListening();
    resetTranscript();
  };

  const restartInterview = () => {
    stopListening();
    resetTranscript();
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowReview(false);
    setRecordingState({
      hasAudioPermission: false,
      hasVideoPermission: false,
      hasScreenPermission: false,
      isRecording: false,
      currentError: null,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };
  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: "en-IN", //"ta-IN"
    });
  };

  
  if (!pdfUploaded) {
    return <PdfUpload onUpload={handlePdfUpload} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center w-full p-4">
      <div
        className={
          `w-6xl ${
            mediaStreamRef.current &&
            screenStreamRef.current &&
            recordingState.hasAudioPermission &&
            recordingState.hasVideoPermission &&
            recordingState.hasScreenPermission &&
            recordingState.isRecording
              ? "grid md:grid-cols-6 gap-4 w-4xl 2xl:w-7xl "
              : "max-w-2xl 2xl:max-w-5xl"
          }`
        }
      >
        <div className="md:col-span-4 flex flex-col items-center gap-4 justify-between">
          <InterviewHeader
            data={{
              title: title,
              round: 1,
              duration: timeLimit,
              // organization: organization,
            }}
          />

          {browserSupportsSpeechRecognition && recordingState.currentError && (
            <div className="p-2 bg-red-100 border border-red-400 text-xs text-red-700 rounded-full px-4">
              {recordingState.currentError}
            </div>
          )}
          {browserSupportsSpeechRecognition &&
          !recordingState.isRecording &&
          !showReview ? (
            <PermissionHandler
              recordingState={recordingState}
              onRequestPermissions={requestPermissions}
            />
          ) : browserSupportsSpeechRecognition && showReview ? (
            <div className="flex flex-col items-center gap-4 w-full bg-white p-4 rounded-md">
              <AnswerReview
                questions={questions}
                answers={answers}
                scheduleID={scheduleID}
              />

              <Label
                text="👨🏻‍💻Thank you for completing all questions."
                size="sm"
                color="text-green-500"
              />

              <Button
                text={"Restart Interview"}
                onClick={restartInterview}
                before={<FiRefreshCw className="w-4 h-4" />}
                color="info"
                size="sm"
              />
            </div>
          ) : (
            <div className="w-full">
              {currentQuestionIndex < questions.length && (
                <div className="">
                  <div className=" relative">
                    <QuestionDisplay
                      question={
                        questions[currentQuestionIndex]
                      }
                      onAnswerSubmit={handleAnswerSubmit}
                      transcript={transcript}
                      timeLeft={timeLeft}
                      totalTime={
                        questions[currentQuestionIndex]
                          .timeToAnswer || DEFAULT_TIME
                      }
                      skipQuestion={skipQuestion}
                      stopListening={stopListening}
                      startListening={startListening}
                      resetTranscript={resetTranscript}
                      listening={listening}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {browserSupportsSpeechRecognition &&
          recordingState.hasAudioPermission &&
          recordingState.hasVideoPermission &&
          recordingState.hasScreenPermission &&
          recordingState.isRecording &&
          mediaStreamRef.current &&
          screenStreamRef.current && (
            <div className="md:col-span-2 bg-white p-4 rounded-md">
              <VideoDisplay
                mediaStream={mediaStreamRef.current}
                screenStream={screenStreamRef.current}
                endInterview={endInterview}
                recordingDuration={recordingDuration}
                setRecordingDuration={setRecordingDuration}
                isRecording={recordingState.isRecording}
              />
            </div>
          )}

        {browserSupportsSpeechRecognition &&
          recordingState.hasAudioPermission &&
          recordingState.hasVideoPermission &&
          recordingState.hasScreenPermission &&
          !recordingState.isRecording &&
          !showReview && (
            <Button
              text="Start Recording"
              onClick={startRecording}
              before={<BiCamera className="w-5 h-5" />}
              color="success"
              isFullWith
              className="mt-4"
              size="sm"
            />
          )}
        {!browserSupportsSpeechRecognition && (
          <Heading title="Browser doesn't support speech recognition." />
        )}
      </div>
    </div>
  );
}

export default App;