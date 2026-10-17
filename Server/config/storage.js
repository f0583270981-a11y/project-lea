// =====================================================
// אחסון תמונות ב-Cloudflare R2 (תואם S3)
// =====================================================
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand
} = require("@aws-sdk/client-s3");

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
};

let client = null;

// הלקוח נוצר רק בשימוש הראשון, אחרי ש-dotenv כבר נטען
const getClient = () => {
    if (client) return client;

    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } =
        process.env;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        throw new Error("חסרים משתני סביבה של R2");
    }

    client = new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
        },
        // R2 לא תומך בבדיקות ה-checksum האוטומטיות של הגרסאות החדשות של ה-SDK
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED"
    });

    return client;
};

const bucket = () => {
    if (!process.env.R2_BUCKET) throw new Error("חסר R2_BUCKET");
    return process.env.R2_BUCKET;
};

// ---------- שמות וכתובות ----------

// מפתח חדש ובלתי ניתן לניחוש לקובץ
const newKey = (originalName = "") => {
    let ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) ext = ".jpg";
    return `uploads/${crypto.randomUUID()}${ext}`;
};

// מפתח הגרסה עם סימן המים
const watermarkedKey = (key) => {
    const { name, ext } = path.posix.parse(key);
    return `uploads/${name}-watermarked${ext}`;
};

const publicUrl = (key) => {
    const base = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
    if (!base) throw new Error("חסר R2_PUBLIC_URL");
    return `${base}/${key}`;
};

// מחלץ מפתח מכתובת שמורה במסד (עובד גם עם כתובות ישנות)
const keyFromUrl = (url) => {
    const clean = String(url || "").split("?")[0];
    return `uploads/${path.posix.basename(clean)}`;
};

const contentTypeFor = (name) =>
    CONTENT_TYPES[path.extname(name).toLowerCase()] ||
    "application/octet-stream";

// ---------- פעולות ----------

const uploadBuffer = async (key, buffer, contentType) => {
    await getClient().send(
        new PutObjectCommand({
            Bucket: bucket(),
            Key: key,
            Body: buffer,
            ContentType: contentType || contentTypeFor(key),
            // שם הקובץ ייחודי ולכן אפשר לשמור בזיכרון המטמון לתמיד
            CacheControl: "public, max-age=31536000, immutable"
        })
    );
};

const uploadFile = async (key, filePath, contentType) => {
    const buffer = await fs.promises.readFile(filePath);
    await uploadBuffer(key, buffer, contentType);
};

const getObjectStream = async (key) => {
    const result = await getClient().send(
        new GetObjectCommand({ Bucket: bucket(), Key: key })
    );
    return result.Body; // Readable
};

const getObjectBuffer = async (key) => {
    const body = await getObjectStream(key);
    return Buffer.from(await body.transformToByteArray());
};

const isNotFound = (error) =>
    error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404;

const deleteKeys = async (keys) => {
    const unique = [...new Set(keys.filter(Boolean))];

    for (let i = 0; i < unique.length; i += 1000) {
        const chunk = unique.slice(i, i + 1000);

        await getClient().send(
            new DeleteObjectsCommand({
                Bucket: bucket(),
                Delete: {
                    Objects: chunk.map((Key) => ({ Key })),
                    Quiet: true
                }
            })
        );
    }
};

module.exports = {
    newKey,
    watermarkedKey,
    publicUrl,
    keyFromUrl,
    contentTypeFor,
    uploadBuffer,
    uploadFile,
    getObjectStream,
    getObjectBuffer,
    isNotFound,
    deleteKeys
};