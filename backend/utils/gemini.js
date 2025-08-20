const axios = require("axios");
const { pool } = require("../db");

async function extractfromJD(jdText) 
{
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const prompt = `
    You are an AI assistant specialized in parsing job descriptions.

    Extract the following fields from the job description. If any field is missing, return string "not provided". One to two words for each skill.
    all the skills should be in lowercase

    Map experience to difficulty using this rule:
      - 0 to 2 years → "beginner"
      - 3 to 5 years → "intermediate"
      - 6+ years → "expert"

      If experience is not provided, you should decide based on the JD

    Return ONLY a JSON object like this:

    {
      "title": "Job title",
      "technicalSkills": ["skill1", "skill2"],
      "softSkills": ["skill1", "skill2"],
      "yearsOfExperience": "2-4",
      "difficulty": "intermediate"
    }

    Job Description:
    """
    ${jdText}
    """
    `;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = content.match(/\{.*\}/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      targetDifficulty = parsed.difficulty;

      console.log("Extracted Skills:", parsed.technicalSkills);
      const result = await pool.query(
        `INSERT INTO jd (title) 
         VALUES ($1) 
         RETURNING jd_id`,
        [parsed.title]
      );
      // RETURN ID 

      // return parsed;
      const jd_id = result.rows[0].jd_id;
      return { jd_id, ...parsed };

    } else {
      throw new Error("No valid JSON response from Gemini.");
    }
  } catch (err) {
    console.error("Error extracting job details:", err.message);
    return null;
  }
}

async function generateQuestions(skill) 
{
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const prompt = `
    You are an AI assistant that generates technical interview questions.

    For the skill "${skill}", generate 15 short questions total:
    - 5 beginner
    - 5 intermediate
    - 5 expert

    For each question, estimate the time (in seconds) an average candidate would take to answer it. Make sure the quesitions are short enough for the candidate to answer in 30 seconds min to 3 minutes max. Max 1 questions per time limit.

    Return ONLY a JSON array like this:
    [
      { 
        "question": "What is X?", 
        "difficulty": "beginner", 
        "time_to_answer": 90
      },
      ...
    ]
    `;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = content.match(/\[.*\]/s);
    if (!match) throw new Error("No valid question array returned.");
    
    return JSON.parse(match[0]);
  } catch (err) {
    console.error(`Error generating questions for ${skill}:`, err.message);
    return [];
  }
}

async function main(skills, jd_id) {
  for (const skill of skills) {
    try {
      const existing = await pool.query("SELECT skill_id FROM skill WHERE name = $1", [skill]);
      let skillId;

      if (existing.rows.length === 0) {
        const insertRes = await pool.query(
          "INSERT INTO skill (name) VALUES ($1) RETURNING skill_id",
          [skill]
        );
        skillId = insertRes.rows[0].skill_id;
        console.log(`Inserted new skill: ${skill}`);

        const questions = await generateQuestions(skill);
        for (const q of questions) {
          await pool.query(
            `INSERT INTO QUESTION (skill_id, questions, timetoanswer, difficulty)
             VALUES ($1, $2, $3, $4)`,
            [skillId, q.question, q.time_to_answer, q.difficulty]
          );
        }

        console.log(`Inserted ${questions.length} questions for ${skill}`);
      } else {
        skillId = existing.rows[0].skill_id;
      }
      
      await pool.query(
        `INSERT INTO jd_skill (jd_id, skill_id) 
         VALUES ($1, $2)`,
        [jd_id, skillId]
      );

      console.log(`Linked skill "${skill}" to JD ${jd_id}`);

    } catch (err) {
      console.error(`Error handling skill "${skill}":`, err.message);
    }
  }
}

async function selectQuestions(skills, targetDifficulty, interviewTimeMinutes, jd_id) {
  try {
    // Insert new schedule
    const schedRes = await pool.query(
      `INSERT INTO schedule (jd_id, interviewtime)
       VALUES ($1, $2)
       RETURNING schedule_id`,
      [jd_id, interviewTimeMinutes]
    );
    const schedule_id = schedRes.rows[0].schedule_id;

    // Time constraints
    const budgetSec = interviewTimeMinutes * 60;
    const minBudget = Math.max(0, budgetSec - 30);
    const maxBudget = budgetSec + 30;

    let totalTime = 0;
    const chosen = [];

    const shuffledSkills = skills.slice().sort(() => Math.random() - 0.5);

    // Skill-prioritized selection
    for (const skillName of shuffledSkills) {
      const pickTarget = Math.random() < 0.8;
      const difficulties = pickTarget
        ? [targetDifficulty, ...["beginner", "intermediate", "expert"].filter(d => d !== targetDifficulty)]
        : ["beginner", "intermediate", "expert"].filter(d => d !== targetDifficulty).concat(targetDifficulty);

      let q = null;
      for (const diff of difficulties) {
        const res = await pool.query(
          `SELECT q.question_id, q.questions AS question_text, q.timetoanswer, q.difficulty
           FROM question q
           JOIN skill s ON s.skill_id = q.skill_id
           WHERE s.name = $1 AND q.difficulty = $2
           ORDER BY RANDOM() LIMIT 1`,
          [skillName, diff]
        );
        if (res.rows.length) {
          q = res.rows[0];
          break;
        }
      }

      if (!q) continue;

      if (totalTime + q.timetoanswer <= maxBudget) {
        chosen.push(q);
        totalTime += q.timetoanswer;
        if (totalTime >= minBudget) break;
      }
    }

    // Filler questions using running total CTE
    if (totalTime < minBudget) {
      const fillRes = await pool.query(
        `WITH randomized_questions AS (
           SELECT
             q.question_id,
             q.questions AS question_text,
             q.timetoanswer,
             q.difficulty,
             SUM(q.timetoanswer) OVER (ORDER BY RANDOM() ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
           FROM question q
         )
         SELECT question_id, question_text, timetoanswer, difficulty
         FROM randomized_questions
         WHERE running_total <= $1`,
        [maxBudget - totalTime]
      );

      for (const q of fillRes.rows) {
        if (chosen.find(c => c.question_id === q.question_id)) continue;
        chosen.push(q);
        totalTime += q.timetoanswer;
        if (totalTime >= minBudget) break;
      }
    }

    // Insert selected questions into schedule_question
    for (const q of chosen) {
      await pool.query(
        `INSERT INTO schedule_question (schedule_id, question_id)
         VALUES ($1, $2)`,
        [schedule_id, q.question_id]
      );
    }

    // Return result
    return {
      schedule_id,
      questions: chosen.map(q => ({
        question_id: q.question_id,
        question: q.question_text,
        difficulty: q.difficulty,
        timetoanswer: q.timetoanswer
      }))
    };
  } catch (err) {
    console.error("Error in selectQuestions:", err);
    throw err;
  }
}

// async function evaluateAnswers(schedule_id, answers) {
//   try {
//     const answerMap = {};
//     for (const ans of answers) {
//       answerMap[ans.id] = ans.text;
//     }

//     const sqRes = await pool.query(
//       `SELECT sq.schedule_question_id,
//               sq.question_id,
//               q.questions AS question_text
//        FROM schedule_question sq
//        JOIN question q ON q.question_id = sq.question_id
//        WHERE sq.schedule_id = $1`,
//       [schedule_id]
//     );
//     const entries = sqRes.rows;

//     let totalScore = 0;
//     const results = [];

//     for (const entry of entries) {
//       const answer = answerMap[entry.question_id] ?? "";
//       const prompt = `
//         You are an AI interviewer.
//         Question: "${entry.question_text}"
//         Candidate Answer: "${answer}"

//         Evaluate the answer on a scale from 0 to 10 and provide constructive feedback one sentence long. The score shuld be zero if the answer is not related to the question. Be strict. Do not be lenient. Only score if the answer has anything to do with the question. Dont score if the answer is same or a rephrase of the question.
//         Return ONLY a JSON object:
//         { "score": <number>, "comments": "text" }
//       `;

//       const gemRes = await axios.post(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         { contents: [{ parts: [{ text: prompt }] }] }
//       );

//       const content = gemRes.data.candidates[0].content.parts[0].text;
//       const parsed = JSON.parse(content.match(/\{.*\}/s)[0]);

//       await pool.query(
//         `UPDATE schedule_question
//          SET answer = $1,
//              score = $2,
//              comments = $3
//          WHERE schedule_question_id = $4`,
//         [answer, parsed.score, parsed.comments, entry.schedule_question_id]
//       );

//       totalScore += parsed.score;
//       results.push({
//         question: entry.question_text,
//         answer,
//         score: parsed.score,
//         comment: parsed.comments
//       });
//     }

//     const avgScore = +(totalScore / entries.length).toFixed(2);
//     const summaryLines = results
//       .map(r => `Question: "${r.question}" - Score: ${r.score}`)
//       .join("\n");
//     const summaryPrompt = `
//       You are an AI hiring manager.
//       Here are the question-and-score pairs:
//       ${summaryLines}
//       Average score: ${avgScore}.
//       Provide a brief overall comment on the candidate's performance.
//       Return ONLY the comment text.
//     `;

//     const sumRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       { contents: [{ parts: [{ text: summaryPrompt }] }] }
//     );
//     const finalComments = sumRes.data.candidates[0].content.parts[0].text.trim();

//     await pool.query(
//       `UPDATE schedule
//        SET score = $1,
//            finalcomments = $2
//        WHERE schedule_id = $3`,
//       [avgScore, finalComments, schedule_id]
//     );

//     console.log(`Evaluated: ${schedule_id}`);
//     // return avgScore;
//     return {
//       schedule_id,
//       questions: results.map(r => ({
//         question: r.question,
//         answer: r.answer,
//         score: r.score,
//         feedback: r.comment
//       })),
//       averageScore: avgScore,
//       overallComments: finalComments
//     };
//   } catch (err) {
//     console.error("Error evaluating answers:", err.message);
//     throw err;
//   }
// }


async function evaluateAnswers(schedule_id, answers) {
  try {
    const answerMap = {};
    for (const ans of answers) {
      answerMap[ans.id] = ans.text;
    }

    const sqRes = await pool.query(
      `
      SELECT sq.schedule_question_id,
             sq.question_id,
             q.questions AS question_text
       FROM schedule_question sq
       JOIN question q ON q.question_id = sq.question_id
       WHERE sq.schedule_id = $1
      `,
      [schedule_id]
    );
    const entries = sqRes.rows;

    let totalScore = 0;
    const results = [];

    for (const entry of entries) {
      const answer = answerMap[entry.question_id] ?? "";
      let parsedScore = 0;
      let parsedComments = ""; // Initialize comments

      // Check if the answer is "Question skipped" or an empty string
      if (answer === "Question skipped" || answer.trim() === "") {
        parsedScore = 0;
        parsedComments = "Question skipped by candidate.";
      } else {
        // Otherwise, proceed with Gemini evaluation
        const prompt = `
          You are an AI interviewer.
          Question: "${entry.question_text}"
          Candidate Answer: "${answer}"

          Evaluate the answer on a scale from 0 to 10 and provide constructive feedback one sentence long. The score should be zero if the answer is not related to the question. Be strict. Do not be lenient. Only score if the answer has anything to do with the question. Don't score if the answer is same or a rephrase of the question.
          Return ONLY a JSON object:
          { "score": <number>, "comments": "text" }
        `;
        const gemRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: prompt }] }] }
        );

        const content = gemRes.data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(content.match(/\{.*\}/s)[0]);
        parsedScore = parsed.score;
        parsedComments = parsed.comments;
      }

      await pool.query(
        `
        UPDATE schedule_question
        SET answer = $1,
            score = $2,
            comments = $3
        WHERE schedule_question_id = $4
        `,
        [answer, parsedScore, parsedComments, entry.schedule_question_id]
      );

      totalScore += parsedScore;
      results.push({
        question: entry.question_text,
        answer,
        score: parsedScore,
        comment: parsedComments,
      });
    }

    const avgScore = +(totalScore / entries.length).toFixed(2);
    const summaryLines = results
      .map((r) => `Question: "${r.question}" - Score: ${r.score}`)
      .join("\n");
    const summaryPrompt = `
      You are an AI hiring manager.
      Here are the question-and-score pairs:
      ${summaryLines}
      Average score: ${avgScore}.
      Provide a brief overall comment on the candidate's performance.
      Return ONLY the comment text.
    `;
    const sumRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: summaryPrompt }] }] }
    );
    const finalComments = sumRes.data.candidates[0].content.parts[0].text.trim();

    await pool.query(
      `
      UPDATE schedule
      SET score = $1,
          finalcomments = $2
      WHERE schedule_id = $3
      `,
      [avgScore, finalComments, schedule_id]
    );

    console.log(`Evaluated: ${schedule_id}`);
    return {
      schedule_id,
      questions: results.map((r) => ({
        question: r.question,
        answer: r.answer,
        score: r.score,
        feedback: r.comment,
      })),
      averageScore: avgScore,
      overallComments: finalComments,
    };
  } catch (err) {
    console.error("Error evaluating answers:", err.message);
    throw err;
  }
}

module.exports = {
  extractfromJD,
  main,
  selectQuestions,
  evaluateAnswers
};
