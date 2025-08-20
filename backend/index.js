const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const uploadRoutes = require("./routes/upload");

dotenv.config();
const app = express();

// Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true //allow cookies
// }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  }
  })
);

app.use("/api", uploadRoutes);

const port = 9000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
