


// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // יצירת תיקיית uploads אם היא לא קיימת
// const uploadDir = path.join(__dirname, "../uploads");

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // סוגי תמונות מותרים
// const allowedMimeTypes = new Set([
//     "image/jpeg",
//     "image/png",
//     "image/webp"
// ]);

// // הגדרת שמירת הקבצים
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },

//     filename: function (req, file, cb) {
//         const extension = path.extname(file.originalname).toLowerCase();
//         const uniqueName =
//             `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

//         cb(null, uniqueName);
//     }
// });

// // הגדרות העלאה מאובטחות יותר
// const upload = multer({
//     storage,

//     limits: {
//         fileSize: 15 * 1024 * 1024, // עד 15MB לכל קובץ
//         files: 1000                 // עד 1000 קבצים בכל בקשת העלאה
//     },

//     fileFilter: function (req, file, cb) {
//         if (allowedMimeTypes.has(file.mimetype)) {
//             return cb(null, true);
//         }

//         const error = new Error(
//             "ניתן להעלות רק תמונות בפורמט JPEG, PNG או WebP"
//         );

//         error.code = "INVALID_FILE_TYPE";

//         return cb(error);
//     }
// });

// module.exports = upload;
// const multer = require("multer")
// const path = require("path")
// const fs = require("fs")

// // וידוא שהתיקייה קיימת
// const uploadDir = path.join(__dirname, "../uploads")
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true })
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir)
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
//     }
// })

// const upload = multer({ storage: storage })
// module.exports = upload


const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

// תיקייה זמנית בלבד. הקבצים נשמרים כאן רק עד שהם עולים ל-R2,
// ונמחקים מיד אחר כך. (בזיכרון לא שומרים: 1000 תמונות היו מפילות את השרת)
const TEMP_DIR = path.join(os.tmpdir(), "gallery-uploads");

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// סוגי תמונות מותרים
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_DIR);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${extension}`);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 15 * 1024 * 1024, // עד 15MB לכל קובץ
        files: 1000                 // עד 1000 קבצים בכל בקשת העלאה
    },

    fileFilter: function (req, file, cb) {
        if (allowedMimeTypes.has(file.mimetype)) {
            return cb(null, true);
        }

        const error = new Error(
            "ניתן להעלות רק תמונות בפורמט JPEG, PNG או WebP"
        );

        error.code = "INVALID_FILE_TYPE";

        return cb(error);
    }
});

module.exports = upload;