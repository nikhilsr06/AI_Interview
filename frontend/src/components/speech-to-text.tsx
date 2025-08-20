import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SpeechToText = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  const handleStartListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: "en-IN", //"ta-IN"
    });
  };
  return (
    <div>
      <p>Microphone: {listening ? "on" : "off"}</p>
      <button onClick={handleStartListening}>Start</button>
      <button onClick={() => SpeechRecognition.stopListening()}>Stop</button>
      <button onClick={() => resetTranscript()}>Reset</button>
      <p>{transcript}</p>
    </div>
  );
};
export { SpeechToText };

