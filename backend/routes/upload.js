const express = require("express");
const multer = require("multer");
const { main, extractfromJD, extractfromResume, selectQuestions, evaluateAnswers } = require("../utils/gemini");
const router = express.Router();
const upload = multer();
const { pool } = require("../db.js");
const pdfParse = require("pdf-parse");

router.post("/upload-jd", upload.single("jd"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await pdfParse(req.file.buffer);
    res.json({ jdText: data.text });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

router.post("/upload-q", async (req, res) => {
  try {
    const { jobDescription} = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Missing JD" });
    }

    const result = await extractfromJD(jobDescription);
    if (!result || !result.technicalSkills || result.technicalSkills.length === 0) {
      return res.status(400).json({ error: "No technical skills extracted from JD" });
    }

    await main(result.technicalSkills, result.jd_id);

    req.session.jdData = {
      jd_id: result.jd_id,
      technicalSkills: result.technicalSkills,
      difficulty: result.difficulty
    };
    

    res.json({
      title: result.title,
      technicalSkills: result.technicalSkills,
      message: "JD processed and skills/questions populated"
    });

  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to process uploaded JD" });
  }
});

router.post("/select-questions", async (req, res) => {
  try {
    const jdData = req.session.jdData;
    const { timeLimit } = req.body;

    if (!timeLimit)
      return res.status(400).json({ error: "Missing timeLimit" });
    
    // const result = await extractfromResume(resume);
    
    // if (!result) 
    //   return res.status(400).json({ error: "No details extracted from Resume" });
    

    const response = await selectQuestions(
      jdData.technicalSkills,
      jdData.difficulty,
      timeLimit,
      // result.candidate_id,
      jdData.jd_id
    );

    req.session.jdData = {
      schedule_id: response.schedule_id
    };
    
    res.json({
      // id: result.candidate_id,
      schedule_id: response.schedule_id,
      questions: response.questions,
      message: "Questions selected successfully"
    });

  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to process uploaded JD" });
  }
});

router.post("/answers", async (req, res) => {
  try {
    
    // const jdData = req.session.jdData;
    const { answers, schedule_id } = req.body;
    console.log("answers: ", answers)
    console.log("schedule_id: ", schedule_id)
    if (!answers)
      return res.status(400).json({ error: "Missing answers" });
    
    
    const response = await evaluateAnswers(
      // jdData.schedule_id,
      schedule_id,
      answers
    );
    res.json(response);

  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to process uploaded JD" });
  }
});

module.exports = router;