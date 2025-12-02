import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure the temp folder exists
const tempPath = path.join(__dirname, "../public/temp/");
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

// Simple filename sanitizer
//sanitize() function replaces everything not a-z, A-Z, or 0-9 with _.
const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, "_");

const storage = multer.diskStorage({
  //  where to save
  destination: (req, file, cb) => cb(null, tempPath),
  //how to name the file.
  filename: (req, file, cb) => {
    //gets filename without extension.
    const name = sanitize(path.parse(file.originalname).name);
    //gets extension (like .jpg).
    const ext = path.extname(file.originalname);

    //ensures uniqueness by appending timestamp.
    const filename = `${name}_${Date.now()}${ext}`;

    // Pass to multer
    cb(null, filename);
  },
});

export default storage;