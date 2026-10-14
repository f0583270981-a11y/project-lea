

const Gallery = require("../models/Gallery");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");


require("dotenv").config();

const WATERMARK_PATH = path.join(
    process.cwd(),
    "watermark",
    "logo.png"
);
const addWatermark = async (inputPath, outputPath) => {
    
    try {
      

        if (!fs.existsSync(WATERMARK_PATH)) {
            throw new Error("קובץ הלוגו לא נמצא");
        }

        const metadata = await sharp(inputPath).metadata();


        const watermarkWidth = Math.max(
            80,
Math.round(metadata.width * 0.60)  );

        const watermarkBuffer = await sharp(WATERMARK_PATH)
            .resize({
                width: watermarkWidth,
                withoutEnlargement: true
            })
            .png()
            .toBuffer();

        await sharp(inputPath)
            .composite([
                {
                    input: watermarkBuffer,
gravity: "southwest",
          //   blend: "over"
                }
            ])
            .jpeg({ quality: 95 })
            .toFile(outputPath);

    } catch (error) {
        console.error("WATERMARK ERROR:", error);
        throw error;
    }
};
// ======================================================
// יצירת סיסמה אקראית
// ======================================================

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
};


// ======================================================
// Nodemailer
// ======================================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ======================================================
// יצירת גלריה
// ======================================================

const createGallery = async (req, res) => {
    try {

        const {
            clientName,
            clientEmail,
            maxSelections,
            rawPhotosLink,
            editedPhotosLink
        } = req.body;

        if (
            !clientName ||
            !clientEmail ||
            maxSelections === undefined ||
            !req.files ||
            req.files.length === 0
        ) {
            return res.status(400).json({
                message: "יש למלא את כל השדות ולצרף תמונות"
            });
        }

        const max = Number(maxSelections);

        if (!Number.isInteger(max) || max < 1) {
            return res.status(400).json({
                message:
                    "מספר הבחירות חייב להיות מספר שלם גדול מ־0"
            });
        }

        const clientPassword =
            generateRandomPassword();

        const hashedPassword =
            await bcrypt.hash(
                clientPassword,
                10
            );

        const baseUrl =
            `${req.protocol}://${req.get("host")}`;

        const images =
            req.files.map((file) => ({

                imageUrl:
                    `${baseUrl}/uploads/${file.filename}`,

                imageName:
                    file.originalname,

                watermarked:
                    false,

                photographerSelected:
                    false,

                clientSelected:
                    false,

                selectionOrder:
                    null
            }));

        const gallery =
            await Gallery.create({

                clientName,

                clientEmail,

                clientPassword:
                    hashedPassword,

                maxSelections:
                    max,

                images,

                rawPhotosLink:
                    rawPhotosLink || "",

                editedPhotosLink:
                    editedPhotosLink || "",

                clientSubmitted:
                    false,

                finalDelivered:
                    false
            });

        const newGallery =
            gallery.toObject();

        delete newGallery.clientPassword;

        return res.status(201).json({

            message:
                "הגלריה נוצרה בהצלחה",

            newGallery,

            clientPassword
        });

    } catch (error) {

        console.error(
            "Create gallery error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה ביצירת הגלריה",

            error:
                error.message
        });
    }
};


// ======================================================
// קבלת כל הגלריות
// ======================================================

const getAllGalleries = async (req, res) => {
    try {

        // const galleries =
        //     await Gallery
                // .find()
                //14/10////
                const galleries = await Gallery.find({ isHidden: { $ne: true } })
                /////
                .select("-clientPassword")
                .sort({
                    createdAt: -1
                })
                .lean();

        return res.json(galleries);

    } catch (error) {

        console.error(
            "Get all galleries error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בטעינת הגלריות",

            error:
                error.message
        });
    }
};


// ======================================================
// קבלת גלריה לצלמת
// ======================================================

const getGalleryForPhotographer = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const gallery =
            await Gallery
                .findById(id)
                .select("-clientPassword");

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        return res.json(gallery);

    } catch (error) {

        console.error(
            "Get gallery error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בטעינת הגלריה",

            error:
                error.message
        });
    }
};


// ======================================================
// התחברות לקוחה
// ======================================================

const clientLogin = async (req, res) => {
    try {

        const { id } = req.params;

        const { password } =
            req.body;

        if (!password) {
            return res.status(400).json({
                message:
                    "יש להזין סיסמה"
            });
        }

        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                gallery.clientPassword
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "סיסמה שגויה"
            });
        }

        const clientToken =
            jwt.sign(

                {
                    galleryId:
                        gallery._id.toString(),

                    type:
                        "client"
                },

                process.env.ACCESS_TOKEN_SECRET,

                {
                    expiresIn:
                        "8h"
                }
            );

        return res.json({

            message:
                "התחברות הצליחה",

            accessToken:
                clientToken
        });

    } catch (error) {

        console.error(
            "Client login error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בהתחברות",

            error:
                error.message
        });
    }
};


// ======================================================
// קבלת גלריה ללקוחה
// ======================================================

const getGalleryForClient = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        if (
            !req.client ||
            req.client.galleryId !== id
        ) {
            return res.status(403).json({
                message:
                    "אין הרשאה לגלריה זו"
            });
        }


//////////13/10/////
    //     const gallery =
    // await Gallery
    //     .findById(id)
    //     .select(
    //         "clientName clientEmail maxSelections images editedPhotosLink finalDelivered editedImages allowClientDownload"
    //     );
const gallery = await Gallery
    .findById(id)
    .select(
        "clientName maxSelections images editedPhotosLink finalDelivered editedImages allowClientDownload"
    );
    //////////////
        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

    
const photographerSelectedImages =
    gallery.images
        .filter(
            image =>
                image.photographerSelected
        )
        .map(
            image => ({
                ...image.toObject(),
                imageUrl:
                    image.watermarkedImageUrl ||
                    image.imageUrl
            })
        );


        return res.json({

            galleryId:
                gallery._id,

            clientName:
                gallery.clientName,

            maxSelections:
                gallery.maxSelections,

            images:
                photographerSelectedImages,

            editedPhotosLink:
                gallery.editedPhotosLink,

            editedImages:
                gallery.editedImages || [],

            finalDelivered:
                gallery.finalDelivered,
            allowClientDownload:
                gallery.allowClientDownload
        });

    } catch (error) {

        console.error(
            "Get client gallery error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בטעינת הגלריה",

            error:
                error.message
        });
    }
};


// ======================================================
// שמירת בחירות הצלמת
// ======================================================

const savePhotographerSelections = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const {
            selectedImageIds
        } = req.body;

        if (
            !Array.isArray(selectedImageIds)
        ) {
            return res.status(400).json({
                message:
                    "selectedImageIds חייב להיות מערך"
            });
        }

        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        gallery.images.forEach(
            (image) => {

                const selected =
                    selectedImageIds.includes(
                        image._id.toString()
                    );

                image.photographerSelected =
                    selected;

                if (!selected) {

                    image.clientSelected =
                        false;

                    image.selectionOrder =
                        null;
                }
            }
        );

        await gallery.save();

        const result =
            gallery.toObject();

        delete result.clientPassword;

        return res.json({

            message:
                "הבחירות נשמרו בהצלחה",

            gallery:
                result
        });

    } catch (error) {

        console.error(
            "Save photographer selections error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בשמירת הבחירות",

            error:
                error.message
        });
    }
};


// ======================================================
// שליחת הגלריה הרגילה ללקוחה
// ======================================================

const sendGalleryToClient = async (req, res) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message: "הגלריה לא נמצאה"
            });
        }

        // איתור התמונות שהצלמת בחרה לשלוח
        const selectedImages = gallery.images.filter(
            image => image.photographerSelected
        );

        // בדיקה לפני יצירת סימני מים
        if (selectedImages.length === 0) {
            return res.status(400).json({
                message: "אין תמונות שנבחרו על ידי הצלמת"
            });
        }

        // יצירת סימני מים רק לתמונות שנבחרו
        for (const image of selectedImages) {
            if (!image.watermarkedImageUrl) {
                const originalFileName = path.basename(
                    image.imageUrl
                );

                const originalPath = path.join(
                    process.cwd(),
                    "uploads",
                    originalFileName
                );

                const watermarkedFileName =
                    `${path.parse(originalFileName).name}-watermarked${path.extname(originalFileName)}`;

                const watermarkedPath = path.join(
                    process.cwd(),
                    "uploads",
                    watermarkedFileName
                );

                await addWatermark(
                    originalPath,
                    watermarkedPath
                );

                image.watermarkedImageUrl =
                    `${req.protocol}://${req.get("host")}/uploads/${watermarkedFileName}`;

                image.watermarked = true;

                console.log(
                    "WATERMARK URL:",
                    image.watermarkedImageUrl
                );
            }
        }

        // יצירת סיסמה חדשה ללקוחה
        const clientPassword = generateRandomPassword();

        const hashedPassword = await bcrypt.hash(
            clientPassword,
            10
        );

        gallery.clientPassword = hashedPassword;

        // שמירת כתובות התמונות עם סימני המים
        await gallery.save();

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        const galleryUrl =
            `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

        // שליחת המייל ללקוחה
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: gallery.clientEmail,
            subject: "הגלריה שלך מוכנה לצפייה",

            html: `
                <div dir="rtl">
                    <h2>שלום ${gallery.clientName}</h2>

                    <p>הגלריה שלך מוכנה לצפייה.</p>

                    <p>לחצי על הקישור:</p>

                    <p>
                        <a href="${galleryUrl}">
                            כניסה לגלריה
                        </a>
                    </p>

                    <p>
                        <strong>סיסמה:</strong>
                        ${clientPassword}
                    </p>

                    <p>נשמח לראות אותך בגלריה.</p>
                </div>
            `
        });

        return res.json({
            message: "הגלריה נשלחה ללקוחה בהצלחה",
            galleryUrl,
            clientPassword
        });

    } catch (error) {
        console.error("Send gallery error:", error);

        return res.status(500).json({
            message: "שגיאה בשליחת הגלריה",
            error: error.message
        });
    }
};


// ======================================================
// שליחת תמונות ערוכות ללקוחה
// ======================================================

const sendEditedGalleryToClient = async (
    gallery
) => {

    const clientPassword =
        generateRandomPassword();

    const hashedPassword =
        await bcrypt.hash(
            clientPassword,
            10
        );

    gallery.clientPassword =
        hashedPassword;

    const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";

    // הקישור דורש התחברות מחדש
    const galleryUrl =
        `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

    await transporter.sendMail({

        from:
            process.env.EMAIL_USER,

        to:
            gallery.clientEmail,

        subject:
            "התמונות הערוכות שלך מוכנות",

        html: `
            <div dir="rtl">

                <h2>
                    שלום ${gallery.clientName}
                </h2>

                <p>
                    התמונות הערוכות שלך מוכנות!
                </p>

                <p>
                    ניתן להיכנס לגלריה דרך הקישור:
                </p>

                <p>
                    <a href="${galleryUrl}">
                        🖼️ כניסה לתמונות הערוכות
                    </a>
                </p>

                <p>
                    <strong>
                        הסיסמה שלך:
                    </strong>

                    ${clientPassword}
                </p>

                <p>
                    לאחר הכניסה תוכלי לצפות
                    בתמונות ולהוריד אותן.
                </p>

            </div>
        `
    });

    return {
        galleryUrl,
        clientPassword
    };
};


// ======================================================
// העלאת תמונות ערוכות
// ======================================================

const uploadEditedImages = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        if (
            !req.files ||
            req.files.length === 0
        ) {
            return res.status(400).json({
                message:
                    "לא נבחרו תמונות להעלאה"
            });
        }

        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        const baseUrl =
            `${req.protocol}://${req.get("host")}`;

       
const newEditedImages = [];

for (const file of req.files) {
    const imageUrl =
        `${baseUrl}/uploads/${file.filename}`;

    const watermarkedFileName =
        `${path.parse(file.filename).name}-watermarked${path.extname(file.filename)}`;

    const watermarkedPath =
        path.join(
            process.cwd(),
            "uploads",
            watermarkedFileName
        );

    await addWatermark(
        file.path,
        watermarkedPath
    );
console.log(
    "WATERMARK CREATED:",
    watermarkedPath,
    fs.existsSync(watermarkedPath)
);
    newEditedImages.push({
        imageUrl,
        watermarkedImageUrl:
            `${baseUrl}/uploads/${watermarkedFileName}`,
        imageName:
            file.originalname
    });
}





        gallery.editedImages.push(
            ...newEditedImages
        );

        // שליחה אוטומטית ללקוחה
        const emailResult =
            await sendEditedGalleryToClient(
                gallery
            );

        gallery.finalDelivered =
            true;

        await gallery.save();

        const result =
            gallery.toObject();

        delete result.clientPassword;

        return res.json({

            message:
                "התמונות הועלו ונשלחו ללקוחה בהצלחה",

            gallery:
                result,

            galleryUrl:
                emailResult.galleryUrl
        });

    } catch (error) {

        console.error(
            "Upload edited images error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בהעלאת התמונות הערוכות",

            error:
                error.message
        });
    }
};


// ======================================================
// קבלת התמונות הערוכות
// ======================================================

const getEditedImages = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const gallery =
            await Gallery
                .findById(id)
                .select(
                    "clientName clientEmail editedImages finalDelivered"
                );

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        return res.json({

            galleryId:
                gallery._id,

            clientName:
                gallery.clientName,

            clientEmail:
                gallery.clientEmail,

            editedImages:
                gallery.editedImages,

            finalDelivered:
                gallery.finalDelivered
        });

    } catch (error) {

        console.error(
            "Get edited images error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בטעינת התמונות הערוכות",

            error:
                error.message
        });
    }
};

const downloadEditedImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message: "הגלריה לא נמצאה"
            });
        }

        const image = gallery.editedImages.id(imageId);

        if (!image) {
            return res.status(404).json({
                message: "התמונה לא נמצאה"
            });
        }

        const withWatermark =
            req.query.watermark === "true";

        const selectedUrl =
            withWatermark
                ? image.watermarkedImageUrl || image.imageUrl
                : image.imageUrl;

        const fileName =
            path.basename(selectedUrl);

        const filePath =
            path.join(
                process.cwd(),
                "uploads",
                fileName
            );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "קובץ התמונה לא נמצא"
            });
        }

        res.download(
            filePath,
            image.imageName || fileName
        );

    } catch (error) {
        console.error(
            "שגיאה בהורדת תמונה ערוכה:",
            error
        );

        res.status(500).json({
            message: "שגיאה בהורדת התמונה"
        });
    }
};
// ======================================================
// הורדת כל התמונות הערוכות כ־ZIP
// ======================================================

const downloadEditedImagesZip = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        if (
            !gallery.editedImages ||
            gallery.editedImages.length === 0
        ) {
            return res.status(404).json({
                message:
                    "אין תמונות ערוכות להורדה"
            })
        }

        const zipName =
            `edited-gallery-${gallery._id}.zip`;

        res.setHeader(
            "Content-Type",
            "application/zip"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${zipName}"`
        );

const archive = archiver("zip", {
    zlib: { level: 9 }
})




        archive.on(
            "error",
            (error) => {

                console.error(
                    "Archive error:",
                    error
                );

                if (!res.headersSent) {
                    res.status(500).end();
                }
            }
        );

        archive.pipe(res);

       const withWatermark =
    req.query.watermark === "true";

let filesAdded = 0;

for (
    const image
    of gallery.editedImages
) {
    const selectedUrl =
        withWatermark
            ? image.watermarkedImageUrl || image.imageUrl
            : image.imageUrl;

    const fileName =
        path.basename(selectedUrl);

            // תיקיית uploads נמצאת
            // בתיקיית הפרויקט הראשית
            const filePath =
                path.join(
                    process.cwd(),
                    "uploads",
                    fileName
                );

            console.log(
                "Checking file:",
                filePath
            );

            if (
                fs.existsSync(filePath)
            ) {

                archive.file(
                    filePath,
                    {
                        name:
                            image.imageName ||
                            fileName
                    }
                );

                filesAdded++;

            } else {

                console.warn(
                    `File not found: ${filePath}`
                );
            }
        }

        if (filesAdded === 0) {

            return res.status(404).json({
                message:
                    "לא נמצאו קבצי תמונות בשרת"
            });
        }

        await archive.finalize();

    } catch (error) {

        console.error(
            "Download ZIP error:",
            error
        );

        if (!res.headersSent) {

            return res.status(500).json({
                message:
                    "שגיאה ביצירת קובץ ZIP",

                error:
                    error.message
            });
        }
    }
};

// ======================================================
// הורדת כל התמונות שהצלמת שלחה ללקוחה כ־ZIP
// ======================================================

const downloadClientGalleryZip = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message: "הגלריה לא נמצאה"
            });
        }

        // בדיקת הרשאת הורדה
        if (gallery.allowClientDownload !== true) {
            return res.status(403).json({
                message: "ההורדה אינה מאושרת עבור גלריה זו"
            });
        }

        // רק התמונות שהצלמת שלחה ללקוחה
        const clientImages = gallery.images.filter(
            image => image.photographerSelected === true
        );

        if (clientImages.length === 0) {
            return res.status(404).json({
                message: "אין תמונות להורדה"
            });
        }

        const zipName =
            `gallery-${gallery._id}.zip`;

        res.setHeader(
            "Content-Type",
            "application/zip"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${zipName}"`
        );

        const archive = archiver("zip", {
            zlib: { level: 9 }
        });

        archive.on("error", (error) => {
            console.error(
                "Client gallery archive error:",
                error
            );

            if (!res.headersSent) {
                res.status(500).end();
            }
        });

        archive.pipe(res);

        let filesAdded = 0;

        for (const image of clientImages) {

            const fileName =
                path.basename(image.imageUrl);

            const filePath =
                path.join(
                    process.cwd(),
                    "uploads",
                    fileName
                );

            console.log(
                "Checking client gallery file:",
                filePath
            );

            if (fs.existsSync(filePath)) {

                archive.file(
                    filePath,
                    {
                        name:
                            image.imageName ||
                            fileName
                    }
                );

                filesAdded++;

            } else {

                console.warn(
                    `File not found: ${filePath}`
                );
            }
        }

        if (filesAdded === 0) {
            return res.status(404).json({
                message:
                    "לא נמצאו קבצי תמונות בשרת"
            });
        }

        await archive.finalize();

    } catch (error) {

        console.error(
            "Download client gallery ZIP error:",
            error
        );

        if (!res.headersSent) {
            return res.status(500).json({
                message:
                    "שגיאה ביצירת קובץ ZIP",
                error:
                    error.message
            });
        }
    }
};
// ======================================================
// שמירת בחירות הלקוחה
// ======================================================

const submitClientSelections = async (
    req,
    res
) => {

    try {

        const { id } = req.params;
//////13/10//////
        // const {
        //     selectedImageIds,
        //     ///12/10//
        //        clientNotes = {}
        //        //////
        // } = req.body;
const {
    selectedImageIds,
    clientNotes = {}
} = req.body;

if (
    clientNotes === null ||
    typeof clientNotes !== "object" ||
    Array.isArray(clientNotes)
) {
    return res.status(400).json({
        message: "ההערות שנשלחו אינן תקינות"
    });
}
///////////////

        if (
            !req.client ||
            req.client.galleryId !== id
        ) {
            return res.status(403).json({
                message:
                    "אין הרשאה לגלריה זו"
            });
        }

        if (
            !Array.isArray(selectedImageIds)
        ) {
            return res.status(400).json({
                message:
                    "selectedImageIds חייב להיות מערך"
            });
        }
        ////
        const uniqueImageIds = new Set(selectedImageIds);

if (uniqueImageIds.size !== selectedImageIds.length) {
    return res.status(400).json({
        message: "נשלחו מזהי תמונות כפולים"
    });
}

        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        const photographerSelectedIds =
            gallery.images
                .filter(
                    image =>
                        image.photographerSelected
                )
                .map(
                    image =>
                        image._id.toString()
                );

        const invalidIds =
            selectedImageIds.filter(
                selectedId =>
                    !photographerSelectedIds.includes(
                        selectedId
                    )
            );

        if (invalidIds.length > 0) {
            return res.status(400).json({
                message:
                    "נבחרה תמונה שאינה זמינה ללקוחה"
            });
        }

        gallery.images.forEach(
            image => {

                image.clientSelected =
                    false;

                image.selectionOrder =
                    null;
            }
        );

        // selectedImageIds.forEach(
        //     (imageId, index) => {

        //         const image =
        //             gallery.images.id(
        //                 imageId
        //             );

        //         if (image) {

        //             image.clientSelected =
        //                 true;

        //             image.selectionOrder =
        //                 index + 1;
        //         }
        //     }
        // );
//12/10/////

selectedImageIds.forEach(
    (imageId, index) => {

        const image =
            gallery.images.id(imageId);

        if (image) {

            image.clientSelected = true;

            image.selectionOrder = index + 1;

            image.clientNote =
                typeof clientNotes[imageId] === "string"
                    ? clientNotes[imageId].trim()
                    : "";
        }
    }
);
///////////
        gallery.clientSubmitted =
            true;

        await gallery.save();

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        const selectionsUrl =
            `${frontendUrl}/gallery/${gallery._id}/selections`;

        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,

            to:
                process.env.EMAIL_USER,

            subject:
                `הלקוחה ${gallery.clientName} שלחה בחירות`,

            html: `
                <div dir="rtl">

                    <h2>
                        הלקוחה ${gallery.clientName}
                        שלחה את הבחירות שלה
                    </h2>

                    <p>
                        מספר התמונות שנבחרו:
                        ${selectedImageIds.length}
                    </p>

                    <p>
                        <a href="${selectionsUrl}">
                            צפייה בבחירות
                        </a>
                    </p>

                </div>
            `
        });

        return res.json({

            message:
                "הבחירות נשמרו בהצלחה",

            selectedCount:
                selectedImageIds.length
        });

    } catch (error) {

        console.error(
            "Submit client selections error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בשמירת הבחירות",

            error:
                error.message
        });
    }
};


// ======================================================
// קבלת בחירות הלקוחה
// ======================================================

const getClientSelections = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const gallery =
            await Gallery
                .findById(id)
                .select("-clientPassword");

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        const selectedImages =
            gallery.images
                .filter(
                    image =>
                        image.clientSelected
                )
                .sort(
                    (a, b) =>
                        a.selectionOrder -
                        b.selectionOrder
                );

        const imagesWithColor =
            selectedImages.map(
                image => {

                    const order =
                        image.selectionOrder;

                    let selectionColor;
                    let selectionColorText;

                    if (
                        order <=
                        gallery.maxSelections
                    ) {

                        selectionColor =
                            "green";

                        selectionColorText =
                            "בחירה רגילה";

                    } else if (
                        order <=
                        gallery.maxSelections + 3
                    ) {

                        selectionColor =
                            "orange";

                        selectionColorText =
                            "3 תמונות נוספות ללא תשלום"

                    } else {

                        selectionColor =
                            "red";

                        selectionColorText =
                            "בתוספת תשלום";
                    }

                    return {

                        ...image.toObject(),

                        selectionColor,

                        selectionColorText
                    };
                }
            );

        return res.json({

            galleryId:
                gallery._id,

            clientName:
                gallery.clientName,

            maxSelections:
                gallery.maxSelections,

            clientSubmitted:
                gallery.clientSubmitted,

            images:
                imagesWithColor
        });

    } catch (error) {

        console.error(
            "Get client selections error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בטעינת בחירות הלקוחה",

            error:
                error.message
        });
    }
};


// ======================================================
// עדכון גלריה
// ======================================================

const updateGalleryById = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

       



        const {
    clientName,
    clientEmail,
    maxSelections,
    rawPhotosLink,
    editedPhotosLink,
    finalDelivered,
    allowClientDownload,
    isHidden
} = req.body;
        const gallery =
            await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        if (
            clientName !== undefined
        ) {
            gallery.clientName =
                clientName;
        }

        if (
            clientEmail !== undefined
        ) {
            gallery.clientEmail =
                clientEmail;
        }

        if (
            maxSelections !== undefined
        ) {

            const max =
                Number(maxSelections);

            if (
                !Number.isInteger(max) ||
                max < 1
            ) {
                return res.status(400).json({
                    message:
                        "מספר הבחירות חייב להיות מספר שלם גדול מ־0"
                });
            }

            gallery.maxSelections =
                max;
        }

        if (
            rawPhotosLink !== undefined
        ) {
            gallery.rawPhotosLink =
                rawPhotosLink;
        }

        if (
            editedPhotosLink !== undefined
        ) {
            gallery.editedPhotosLink =
                editedPhotosLink;
        }

        if (
            finalDelivered !== undefined
        ) {
            gallery.finalDelivered =
                finalDelivered;
        }
        if (
    allowClientDownload !== undefined
) {
    gallery.allowClientDownload =
        allowClientDownload;
}
////////14/10/////
if (isHidden !== undefined) {
    if (typeof isHidden !== "boolean") {
        return res.status(400).json({
            message: "ערך ההסתרה חייב להיות true או false"
        });
    }

    gallery.isHidden = isHidden;
}
//////////
        await gallery.save();

        const result =
            gallery.toObject();

        delete result.clientPassword;

        return res.json({

            message:
                "הגלריה עודכנה בהצלחה",

            gallery:
                result
        });

    } catch (error) {

        console.error(
            "Update gallery error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה בעדכון הגלריה",

            error:
                error.message
        });
    }
};


// ======================================================
// מחיקת גלריה
// ======================================================

const deleteGalleryById = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const gallery =
            await Gallery.findByIdAndDelete(id);

        if (!gallery) {
            return res.status(404).json({
                message:
                    "הגלריה לא נמצאה"
            });
        }

        return res.json({
            message:
                "הגלריה נמחקה בהצלחה"
        });

    } catch (error) {

        console.error(
            "Delete gallery error:",
            error
        );

        return res.status(500).json({
            message:
                "שגיאה במחיקת הגלריה",

            error:
                error.message
        });
    }
};


// ======================================================
// ייצוא
// ======================================================

module.exports = {

    createGallery,

    getAllGalleries,

    getGalleryForPhotographer,

    clientLogin,

    getGalleryForClient,

    savePhotographerSelections,

    sendGalleryToClient,
    downloadClientGalleryZip,

    submitClientSelections,

    getClientSelections,

    updateGalleryById,

    deleteGalleryById,

    uploadEditedImages,

    getEditedImages,

    sendEditedGalleryToClient,
    downloadEditedImage,

    downloadEditedImagesZip,
};