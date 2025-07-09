 const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ message: "File uploaded successfully!", file: req.file });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
