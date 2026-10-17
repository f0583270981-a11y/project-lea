const path = require("path");

// שורש הפרויקט (התיקייה שמכילה את server.js, config, middleware וכו')
const ROOT_DIR = path.join(__dirname, "..");

// מקור אחד ויחיד לתיקיית ההעלאות.
// משמש את multer, את ההגשה הסטטית ב-server.js ואת ה-controller,
// כך שהנתיב זהה גם אם השרת מופעל מתיקייה אחרת.
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");

// קובץ הלוגו לסימן המים
const WATERMARK_PATH = path.join(ROOT_DIR, "watermark", "logo.png");

module.exports = {
    ROOT_DIR,
    UPLOADS_DIR,
    WATERMARK_PATH
};