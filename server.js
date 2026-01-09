const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

/* ===============================
   CONNECT DATABASE
================================ */
connectDB();

/* ===============================
   MIDDLEWARES
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://examify.vercel.app",
      "https://examify.exoiteitservices.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);




app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/exam", require("./routes/examRoutes"));
app.use("/api/question", require("./routes/questionRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

/* ===============================
   HEALTH CHECK (VERY IMPORTANT)
================================ */
app.get("/", (req, res) => {
  res.send("✅ Examify Backend is running");
});

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
