export interface QuestionProps {
  id: string;
  text: string;
  timeToAnswer: number;
  difficulty: string;
  number: number;
}

export interface InterviewQuestionProps{
  job_title:string;
  duration:number;
  round:number;
  organization:string;
  questions:QuestionProps[];
}


export interface Answer {
  id: string;
  text: string;
}

export interface RecordingState {
  hasAudioPermission: boolean;
  hasVideoPermission: boolean;
  hasScreenPermission: boolean;
  isRecording: boolean;
  currentError: string | null;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
