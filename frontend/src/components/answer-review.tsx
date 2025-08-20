// import React from "react";
// import { Heading, Label } from "./common";
// import { Answer, Question } from "./interfaces";

// interface AnswerReviewProps {
//   questions: Question[];
//   answers: Answer[];
// }

// const AnswerReview: React.FC<AnswerReviewProps> = ({ questions, answers }) => {
//   return (
//     <>
//       <Heading title="Interview Summary: Questions & Answers" />

//       <div className="space-y-4 max-h-[350px] overflow-y-auto">
//         {questions.map((question, index) => {
//           const answer = answers.find((a) => a.id === question.id);
//           return (
//             <div
//               key={question.id}
//               className="bg-gray-100 rounded-md p-4 flex flex-col gap-2"
//             >
//               <div className="flex flex-col gap-2">
//                 <Label
//                   text={`${index + 1}. ${question.text}`}
//                   color="text-gray-500"
//                 />
//                 <Label text={`🗣️: ${answer?.text || "No answer provided"}`} />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// };

// export { AnswerReview };




















import React, { useEffect, useRef, useState } from "react";
import { Heading, Label } from "./common";
import { Answer, Question } from "./interfaces";

interface Feedback {
  questions: { question: string; answer: string; score: number; feedback: string }[];
  averageScore: number;
  overallComments: string;
} 

interface AnswerReviewProps {
  questions: Question[];
  answers: Answer[];
  scheduleID: string; 
}

const AnswerReview: React.FC<AnswerReviewProps> = ({ questions, answers, scheduleID }) => {
  const submittedRef = useRef(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const submitAnswers = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      console.log("Submitting answers:", answers, "for schedule ID:", scheduleID);
      const response = await fetch('http://localhost:9000/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, schedule_id: scheduleID }),
      });

      if (!response.ok) 
        throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  useEffect(() => {
    submitAnswers();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Heading title="Interview Summary: Questions & Answers" />

      <div className="space-y-4 max-h-[350px] overflow-y-auto">
        {questions.map((question, index) => {
          const answer = answers.find((a) => a.id === question.id);
          return (
            <div
              key={question.id}
              className="bg-gray-100 rounded-md p-4 flex flex-col gap-2"
            >
              <div className="flex flex-col gap-2">
                <Label
                  text={`${index + 1}. ${question.text}`}
                  color="text-gray-500"
                />
                <Label text={`🗣️: ${answer?.text || "No answer provided"}`} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setShowFeedback((prev) => !prev)}
        disabled={!feedback}
      >
        {showFeedback ? "Hide Feedback" : "View Feedback"}
      </button>

      {showFeedback && feedback && (
        <div className="mt-6 p-6 bg-white shadow rounded-lg space-y-6">
          <h2 className="text-xl font-semibold">Feedback & Scores</h2>

          <div className="space-y-4">
            {feedback.questions.map((q, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2"
              >
                <div className="text-gray-800">Question {idx + 1}: {q.question}</div>
                <div className="text-gray-500">Answer: {q.answer}</div>
                <hr />
                <div className="text-gray-800">
                  <b>Feedback:</b> <i>{q.feedback}</i>
                </div>
                <div className="text-blue-700">
                  <b>Score:</b> <span className="font-bold">{q.score}/10</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-300">
            <br />
            <div className="text-lg font-semibold text-blue-700">
              Overall Score: <span className="text-black">{feedback.averageScore}/10</span>
            </div>
            <div className="text-md mt-1 text-gray-800">
              <b>Overall Feedback:</b> {feedback.overallComments}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export { AnswerReview };