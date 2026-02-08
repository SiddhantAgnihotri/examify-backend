const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { examId } = req.params;
    const studentId = req.user.id;

    const dir = `uploads/submissions/${examId}/${studentId}`;
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
