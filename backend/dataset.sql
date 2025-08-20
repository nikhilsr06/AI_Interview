-- -- 1. SKILL TABLE
-- CREATE TABLE skill (
--     skill_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     name VARCHAR(100) NOT NULL UNIQUE
-- );

-- -- 2. SKILL_QUESTION TABLE
-- CREATE TABLE skill_question (
--     id SERIAL PRIMARY KEY,
--     skill_id INTEGER NOT NULL REFERENCES skill(skill_id) ON DELETE CASCADE,
--     question TEXT NOT NULL,
--     time_to_answer INTEGER NOT NULL, -- in minutes
--     difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert'))
-- );

-- -- 3. JD_QUESTIONS TABLE
-- CREATE TABLE jd_questions (
--     jd_id SERIAL PRIMARY KEY,
--     skill_id INTEGER REFERENCES skill(skill_id) ON DELETE SET NULL,
--     question TEXT NOT NULL
-- );


-- CREATE TABLE jd_questions2 (
--     jdq_id SERIAL PRIMARY KEY,
--     jd_id INTEGER NOT NULL,
--     skill_id INTEGER REFERENCES skill(skill_id) ON DELETE SET NULL,
--     question TEXT NOT NULL
-- );







------------------------------------------------------------------------------------------------









+create JD -> Skill as Array = [React, Node, PostgreSQL]

React		- Beginner - 50, Intermediate - 50, Expert - 100
Node		- Beginner - 50, Intermediate - 50, Expert - 100
PostgreSQL	- Beginner - 50, Intermediate - 50, Expert - 100



Resume Upload -> jd Experiene - 2 - 5 -> Intermediate

45 Min

24 Min - Intermediate
6 Min - Expert, Beginner



Table - JD, JD_SKILL, SKILL, SKILL_QUESTIONS, SCHEDULE, CANDIDATE
=================================================================

JD - JD_ID (PK), TITLE

JD_SKILL - JD_SKILL_ID (PK), JD_ID (FK), SKILL_ID (FK)

SKILL - SKILL_ID (PK), NAME

QUESTION - QUESTION_ID (PK), SKILL_ID (FK), QUESTIONS, TimeToAnswer, DIFFICULTY

CANDITATE - CANDITATE_ID (PK), Email, NAME

SCHEDULE_QUESTION - SCHEDULE_QUESTION_ID (PK), SCHEDULE_ID (FK), QUESTION_ID (FK), ANSWER, SCORE, COMMENTS			- for each q

SCHEDULE - SCHEDULE_ID (PK), CANDITATE_ID (FK), JD_ID (FK), InterviewTime, SCORE, FinalComments	                    - overall q







----------------------------------------------------------------------------------------------------













-- Table: JD
CREATE TABLE JD (
    JD_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    TITLE VARCHAR(255) NOT NULL
);

-- Table: SKILL
CREATE TABLE SKILL (
    skill_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL
);

-- Table: JD_SKILL
CREATE TABLE JD_SKILL (
    JD_SKILL_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    JD_ID UUID,
    SKILL_ID INT,
    FOREIGN KEY (JD_ID) REFERENCES JD(JD_ID),
    FOREIGN KEY (SKILL_ID) REFERENCES SKILL(SKILL_ID)
);

-- Table: QUESTION
CREATE TABLE QUESTION (
    QUESTION_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    SKILL_ID INT,
    QUESTIONS TEXT NOT NULL,
    TimeToAnswer INT, -- in seconds or minutes depending on requirement
    DIFFICULTY VARCHAR(50),
    FOREIGN KEY (SKILL_ID) REFERENCES SKILL(SKILL_ID)
);

-- Table: CANDIDATE
CREATE TABLE CANDIDATE (
    CANDIDATE_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(255) NOT NULL,
    NAME VARCHAR(255) NOT NULL
);

-- Table: SCHEDULE
CREATE TABLE SCHEDULE (
    SCHEDULE_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CANDIDATE_ID UUID,
    JD_ID UUID,
    InterviewTime TIMESTAMP,
    SCORE DECIMAL(5,2),
    FinalComments TEXT,
    FOREIGN KEY (CANDIDATE_ID) REFERENCES CANDIDATE(CANDIDATE_ID),
    FOREIGN KEY (JD_ID) REFERENCES JD(JD_ID)
);


-- Table: SCHEDULE_QUESTION
CREATE TABLE SCHEDULE_QUESTION (
    SCHEDULE_QUESTION_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    SCHEDULE_ID UUID,
    QUESTION_ID UUID,
    ANSWER TEXT,
    SCORE DECIMAL(5,2),
    COMMENTS TEXT,
    FOREIGN KEY (SCHEDULE_ID) REFERENCES SCHEDULE(SCHEDULE_ID),
    FOREIGN KEY (QUESTION_ID) REFERENCES QUESTION(QUESTION_ID)
);









------------

1. User upload JD
2. Fill JD, SKILL, JD_SKILL, QUESTION
3. User upload Resume
4. Fill CANDIDATE, SCHEDULE, SCHEDULE_QUESTION
