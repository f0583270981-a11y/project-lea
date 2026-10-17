

// const Gallery = require("../models/Gallery");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const archiver = require("archiver");
// const path = require("path");
// const fs = require("fs");
// const sharp = require("sharp");


// require("dotenv").config();

// const WATERMARK_PATH = path.join(
//     process.cwd(),
//     "watermark",
//     "logo.png"
// );
// const addWatermark = async (inputPath, outputPath) => {
    
//     try {
      

//         if (!fs.existsSync(WATERMARK_PATH)) {
//             throw new Error("קובץ הלוגו לא נמצא");
//         }

//         const metadata = await sharp(inputPath).metadata();


//         const watermarkWidth = Math.max(
//             80,
// Math.round(metadata.width * 0.60)  );

//         const watermarkBuffer = await sharp(WATERMARK_PATH)
//             .resize({
//                 width: watermarkWidth,
//                 withoutEnlargement: true
//             })
//             .png()
//             .toBuffer();

//         await sharp(inputPath)
//             .composite([
//                 {
//                     input: watermarkBuffer,
// gravity: "southwest",
//           //   blend: "over"
//                 }
//             ])
//             .jpeg({ quality: 95 })
//             .toFile(outputPath);

//     } catch (error) {
//         console.error("WATERMARK ERROR:", error);
//         throw error;
//     }
// };
// // ======================================================
// // יצירת סיסמה אקראית
// // ======================================================

// const generateRandomPassword = () => {
//     return Math.random().toString(36).slice(-8);
// };


// // ======================================================
// // Nodemailer
// // ======================================================

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });


// // ======================================================
// // יצירת גלריה
// // ======================================================

// const createGallery = async (req, res) => {
//     try {

//         const {
//             clientName,
//             clientEmail,
//             maxSelections,
//             rawPhotosLink,
//             editedPhotosLink
//         } = req.body;

//         if (
//             !clientName ||
//             !clientEmail ||
//             maxSelections === undefined ||
//             !req.files ||
//             req.files.length === 0
//         ) {
//             return res.status(400).json({
//                 message: "יש למלא את כל השדות ולצרף תמונות"
//             });
//         }

//         const max = Number(maxSelections);

//         if (!Number.isInteger(max) || max < 1) {
//             return res.status(400).json({
//                 message:
//                     "מספר הבחירות חייב להיות מספר שלם גדול מ־0"
//             });
//         }

//         const clientPassword =
//             generateRandomPassword();

//         const hashedPassword =
//             await bcrypt.hash(
//                 clientPassword,
//                 10
//             );

//         const baseUrl =
//             `${req.protocol}://${req.get("host")}`;

//         const images =
//             req.files.map((file) => ({

//                 imageUrl:
//                     `${baseUrl}/uploads/${file.filename}`,

//                 imageName:
//                     file.originalname,

//                 watermarked:
//                     false,

//                 photographerSelected:
//                     false,

//                 clientSelected:
//                     false,

//                 selectionOrder:
//                     null
//             }));

//         const gallery =
//             await Gallery.create({

//                 clientName,

//                 clientEmail,

//                 clientPassword:
//                     hashedPassword,

//                 maxSelections:
//                     max,

//                 images,

//                 rawPhotosLink:
//                     rawPhotosLink || "",

//                 editedPhotosLink:
//                     editedPhotosLink || "",

//                 clientSubmitted:
//                     false,

//                 finalDelivered:
//                     false
//             });

//         const newGallery =
//             gallery.toObject();

//         delete newGallery.clientPassword;

//         return res.status(201).json({

//             message:
//                 "הגלריה נוצרה בהצלחה",

//             newGallery,

//             clientPassword
//         });

//     } catch (error) {

//         console.error(
//             "Create gallery error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה ביצירת הגלריה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // קבלת כל הגלריות
// // ======================================================

// const getAllGalleries = async (req, res) => {
//     try {

//         // const galleries =
//         //     await Gallery
//                 // .find()
//                 //14/10////
//                 const galleries = await Gallery.find({ isHidden: { $ne: true } })
//                 /////
//                 .select("-clientPassword")
//                 .sort({
//                     createdAt: -1
//                 })
//                 .lean();

//         return res.json(galleries);

//     } catch (error) {

//         console.error(
//             "Get all galleries error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בטעינת הגלריות",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // קבלת גלריה לצלמת
// // ======================================================

// const getGalleryForPhotographer = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const gallery =
//             await Gallery
//                 .findById(id)
//                 .select("-clientPassword");

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         return res.json(gallery);

//     } catch (error) {

//         console.error(
//             "Get gallery error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בטעינת הגלריה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // התחברות לקוחה
// // ======================================================

// const clientLogin = async (req, res) => {
//     try {

//         const { id } = req.params;

//         const { password } =
//             req.body;

//         if (!password) {
//             return res.status(400).json({
//                 message:
//                     "יש להזין סיסמה"
//             });
//         }

//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         const passwordMatch =
//             await bcrypt.compare(
//                 password,
//                 gallery.clientPassword
//             );

//         if (!passwordMatch) {
//             return res.status(401).json({
//                 message:
//                     "סיסמה שגויה"
//             });
//         }

//         const clientToken =
//             jwt.sign(

//                 {
//                     galleryId:
//                         gallery._id.toString(),

//                     type:
//                         "client"
//                 },

//                 process.env.ACCESS_TOKEN_SECRET,

//                 {
//                     expiresIn:
//                         "8h"
//                 }
//             );

//         return res.json({

//             message:
//                 "התחברות הצליחה",

//             accessToken:
//                 clientToken
//         });

//     } catch (error) {

//         console.error(
//             "Client login error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בהתחברות",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // קבלת גלריה ללקוחה
// // ======================================================

// const getGalleryForClient = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         if (
//             !req.client ||
//             req.client.galleryId !== id
//         ) {
//             return res.status(403).json({
//                 message:
//                     "אין הרשאה לגלריה זו"
//             });
//         }


// //////////13/10/////
//     //     const gallery =
//     // await Gallery
//     //     .findById(id)
//     //     .select(
//     //         "clientName clientEmail maxSelections images editedPhotosLink finalDelivered editedImages allowClientDownload"
//     //     );
// const gallery = await Gallery
//     .findById(id)
//     .select(
//         "clientName maxSelections images editedPhotosLink finalDelivered editedImages allowClientDownload"
//     );
//     //////////////
//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

    
// const photographerSelectedImages =
//     gallery.images
//         .filter(
//             image =>
//                 image.photographerSelected
//         )
//         .map(
//             image => ({
//                 ...image.toObject(),
//                 imageUrl:
//                     image.watermarkedImageUrl ||
//                     image.imageUrl
//             })
//         );


//         return res.json({

//             galleryId:
//                 gallery._id,

//             clientName:
//                 gallery.clientName,

//             maxSelections:
//                 gallery.maxSelections,

//             images:
//                 photographerSelectedImages,

//             editedPhotosLink:
//                 gallery.editedPhotosLink,

//             editedImages:
//                 gallery.editedImages || [],

//             finalDelivered:
//                 gallery.finalDelivered,
//             allowClientDownload:
//                 gallery.allowClientDownload
//         });

//     } catch (error) {

//         console.error(
//             "Get client gallery error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בטעינת הגלריה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // שמירת בחירות הצלמת
// // ======================================================

// const savePhotographerSelections = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const {
//             selectedImageIds
//         } = req.body;

//         if (
//             !Array.isArray(selectedImageIds)
//         ) {
//             return res.status(400).json({
//                 message:
//                     "selectedImageIds חייב להיות מערך"
//             });
//         }

//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         gallery.images.forEach(
//             (image) => {

//                 const selected =
//                     selectedImageIds.includes(
//                         image._id.toString()
//                     );

//                 image.photographerSelected =
//                     selected;

//                 if (!selected) {

//                     image.clientSelected =
//                         false;

//                     image.selectionOrder =
//                         null;
//                 }
//             }
//         );

//         await gallery.save();

//         const result =
//             gallery.toObject();

//         delete result.clientPassword;

//         return res.json({

//             message:
//                 "הבחירות נשמרו בהצלחה",

//             gallery:
//                 result
//         });

//     } catch (error) {

//         console.error(
//             "Save photographer selections error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בשמירת הבחירות",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // שליחת הגלריה הרגילה ללקוחה
// // ======================================================

// const sendGalleryToClient = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const gallery = await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message: "הגלריה לא נמצאה"
//             });
//         }

//         // איתור התמונות שהצלמת בחרה לשלוח
//         const selectedImages = gallery.images.filter(
//             image => image.photographerSelected
//         );

//         // בדיקה לפני יצירת סימני מים
//         if (selectedImages.length === 0) {
//             return res.status(400).json({
//                 message: "אין תמונות שנבחרו על ידי הצלמת"
//             });
//         }

//         // יצירת סימני מים רק לתמונות שנבחרו
//         for (const image of selectedImages) {
//             if (!image.watermarkedImageUrl) {
//                 const originalFileName = path.basename(
//                     image.imageUrl
//                 );

//                 const originalPath = path.join(
//                     process.cwd(),
//                     "uploads",
//                     originalFileName
//                 );

//                 const watermarkedFileName =
//                     `${path.parse(originalFileName).name}-watermarked${path.extname(originalFileName)}`;

//                 const watermarkedPath = path.join(
//                     process.cwd(),
//                     "uploads",
//                     watermarkedFileName
//                 );

//                 await addWatermark(
//                     originalPath,
//                     watermarkedPath
//                 );

//                 image.watermarkedImageUrl =
//                     `${req.protocol}://${req.get("host")}/uploads/${watermarkedFileName}`;

//                 image.watermarked = true;

//                 console.log(
//                     "WATERMARK URL:",
//                     image.watermarkedImageUrl
//                 );
//             }
//         }

//         // יצירת סיסמה חדשה ללקוחה
//         const clientPassword = generateRandomPassword();

//         const hashedPassword = await bcrypt.hash(
//             clientPassword,
//             10
//         );

//         gallery.clientPassword = hashedPassword;

//         // שמירת כתובות התמונות עם סימני המים
//         await gallery.save();

//         const frontendUrl =
//             process.env.FRONTEND_URL ||
//             "http://localhost:5173";

//         const galleryUrl =
//             `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

//         // שליחת המייל ללקוחה
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: gallery.clientEmail,
//             subject: "הגלריה שלך מוכנה לצפייה",

//             html: `
//                 <div dir="rtl">
//                     <h2>שלום ${gallery.clientName}</h2>

//                     <p>הגלריה שלך מוכנה לצפייה.</p>

//                     <p>לחצי על הקישור:</p>

//                     <p>
//                         <a href="${galleryUrl}">
//                             כניסה לגלריה
//                         </a>
//                     </p>

//                     <p>
//                         <strong>סיסמה:</strong>
//                         ${clientPassword}
//                     </p>

//                     <p>נשמח לראות אותך בגלריה.</p>
//                 </div>
//             `
//         });

//         return res.json({
//             message: "הגלריה נשלחה ללקוחה בהצלחה",
//             galleryUrl,
//             clientPassword
//         });

//     } catch (error) {
//         console.error("Send gallery error:", error);

//         return res.status(500).json({
//             message: "שגיאה בשליחת הגלריה",
//             error: error.message
//         });
//     }
// };


// // ======================================================
// // שליחת תמונות ערוכות ללקוחה
// // ======================================================

// const sendEditedGalleryToClient = async (
//     gallery
// ) => {

//     const clientPassword =
//         generateRandomPassword();

//     const hashedPassword =
//         await bcrypt.hash(
//             clientPassword,
//             10
//         );

//     gallery.clientPassword =
//         hashedPassword;

//     const frontendUrl =
//         process.env.FRONTEND_URL ||
//         "http://localhost:5173";

//     // הקישור דורש התחברות מחדש
//     const galleryUrl =
//         `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

//     await transporter.sendMail({

//         from:
//             process.env.EMAIL_USER,

//         to:
//             gallery.clientEmail,

//         subject:
//             "התמונות הערוכות שלך מוכנות",

//         html: `
//             <div dir="rtl">

//                 <h2>
//                     שלום ${gallery.clientName}
//                 </h2>

//                 <p>
//                     התמונות הערוכות שלך מוכנות!
//                 </p>

//                 <p>
//                     ניתן להיכנס לגלריה דרך הקישור:
//                 </p>

//                 <p>
//                     <a href="${galleryUrl}">
//                         🖼️ כניסה לתמונות הערוכות
//                     </a>
//                 </p>

//                 <p>
//                     <strong>
//                         הסיסמה שלך:
//                     </strong>

//                     ${clientPassword}
//                 </p>

//                 <p>
//                     לאחר הכניסה תוכלי לצפות
//                     בתמונות ולהוריד אותן.
//                 </p>

//             </div>
//         `
//     });

//     return {
//         galleryUrl,
//         clientPassword
//     };
// };


// // ======================================================
// // העלאת תמונות ערוכות
// // ======================================================

// const uploadEditedImages = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         if (
//             !req.files ||
//             req.files.length === 0
//         ) {
//             return res.status(400).json({
//                 message:
//                     "לא נבחרו תמונות להעלאה"
//             });
//         }

//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         const baseUrl =
//             `${req.protocol}://${req.get("host")}`;

       
// const newEditedImages = [];

// for (const file of req.files) {
//     const imageUrl =
//         `${baseUrl}/uploads/${file.filename}`;

//     const watermarkedFileName =
//         `${path.parse(file.filename).name}-watermarked${path.extname(file.filename)}`;

//     const watermarkedPath =
//         path.join(
//             process.cwd(),
//             "uploads",
//             watermarkedFileName
//         );

//     await addWatermark(
//         file.path,
//         watermarkedPath
//     );
// console.log(
//     "WATERMARK CREATED:",
//     watermarkedPath,
//     fs.existsSync(watermarkedPath)
// );
//     newEditedImages.push({
//         imageUrl,
//         watermarkedImageUrl:
//             `${baseUrl}/uploads/${watermarkedFileName}`,
//         imageName:
//             file.originalname
//     });
// }





//         gallery.editedImages.push(
//             ...newEditedImages
//         );

//         // שליחה אוטומטית ללקוחה
//         const emailResult =
//             await sendEditedGalleryToClient(
//                 gallery
//             );

//         gallery.finalDelivered =
//             true;

//         await gallery.save();

//         const result =
//             gallery.toObject();

//         delete result.clientPassword;

//         return res.json({

//             message:
//                 "התמונות הועלו ונשלחו ללקוחה בהצלחה",

//             gallery:
//                 result,

//             galleryUrl:
//                 emailResult.galleryUrl
//         });

//     } catch (error) {

//         console.error(
//             "Upload edited images error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בהעלאת התמונות הערוכות",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // קבלת התמונות הערוכות
// // ======================================================

// const getEditedImages = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const gallery =
//             await Gallery
//                 .findById(id)
//                 .select(
//                     "clientName clientEmail editedImages finalDelivered"
//                 );

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         return res.json({

//             galleryId:
//                 gallery._id,

//             clientName:
//                 gallery.clientName,

//             clientEmail:
//                 gallery.clientEmail,

//             editedImages:
//                 gallery.editedImages,

//             finalDelivered:
//                 gallery.finalDelivered
//         });

//     } catch (error) {

//         console.error(
//             "Get edited images error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בטעינת התמונות הערוכות",

//             error:
//                 error.message
//         });
//     }
// };

// const downloadEditedImage = async (req, res) => {
//     try {
//         const { id, imageId } = req.params;

//         const gallery = await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message: "הגלריה לא נמצאה"
//             });
//         }

//         const image = gallery.editedImages.id(imageId);

//         if (!image) {
//             return res.status(404).json({
//                 message: "התמונה לא נמצאה"
//             });
//         }

//         const withWatermark =
//             req.query.watermark === "true";

//         const selectedUrl =
//             withWatermark
//                 ? image.watermarkedImageUrl || image.imageUrl
//                 : image.imageUrl;

//         const fileName =
//             path.basename(selectedUrl);

//         const filePath =
//             path.join(
//                 process.cwd(),
//                 "uploads",
//                 fileName
//             );

//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({
//                 message: "קובץ התמונה לא נמצא"
//             });
//         }

//         res.download(
//             filePath,
//             image.imageName || fileName
//         );

//     } catch (error) {
//         console.error(
//             "שגיאה בהורדת תמונה ערוכה:",
//             error
//         );

//         res.status(500).json({
//             message: "שגיאה בהורדת התמונה"
//         });
//     }
// };
// // ======================================================
// // הורדת כל התמונות הערוכות כ־ZIP
// // ======================================================

// const downloadEditedImagesZip = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         if (
//             !gallery.editedImages ||
//             gallery.editedImages.length === 0
//         ) {
//             return res.status(404).json({
//                 message:
//                     "אין תמונות ערוכות להורדה"
//             })
//         }

//         const zipName =
//             `edited-gallery-${gallery._id}.zip`;

//         res.setHeader(
//             "Content-Type",
//             "application/zip"
//         );

//         res.setHeader(
//             "Content-Disposition",
//             `attachment; filename="${zipName}"`
//         );

// const archive = archiver("zip", {
//     zlib: { level: 9 }
// })




//         archive.on(
//             "error",
//             (error) => {

//                 console.error(
//                     "Archive error:",
//                     error
//                 );

//                 if (!res.headersSent) {
//                     res.status(500).end();
//                 }
//             }
//         );

//         archive.pipe(res);

//        const withWatermark =
//     req.query.watermark === "true";

// let filesAdded = 0;

// for (
//     const image
//     of gallery.editedImages
// ) {
//     const selectedUrl =
//         withWatermark
//             ? image.watermarkedImageUrl || image.imageUrl
//             : image.imageUrl;

//     const fileName =
//         path.basename(selectedUrl);

//             // תיקיית uploads נמצאת
//             // בתיקיית הפרויקט הראשית
//             const filePath =
//                 path.join(
//                     process.cwd(),
//                     "uploads",
//                     fileName
//                 );

//             console.log(
//                 "Checking file:",
//                 filePath
//             );

//             if (
//                 fs.existsSync(filePath)
//             ) {

//                 archive.file(
//                     filePath,
//                     {
//                         name:
//                             image.imageName ||
//                             fileName
//                     }
//                 );

//                 filesAdded++;

//             } else {

//                 console.warn(
//                     `File not found: ${filePath}`
//                 );
//             }
//         }

//         if (filesAdded === 0) {

//             return res.status(404).json({
//                 message:
//                     "לא נמצאו קבצי תמונות בשרת"
//             });
//         }

//         await archive.finalize();

//     } catch (error) {

//         console.error(
//             "Download ZIP error:",
//             error
//         );

//         if (!res.headersSent) {

//             return res.status(500).json({
//                 message:
//                     "שגיאה ביצירת קובץ ZIP",

//                 error:
//                     error.message
//             });
//         }
//     }
// };

// // ======================================================
// // הורדת כל התמונות שהצלמת שלחה ללקוחה כ־ZIP
// // ======================================================

// const downloadClientGalleryZip = async (
//     req,
//     res
// ) => {
//     try {
//         const { id } = req.params;

//         const gallery = await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message: "הגלריה לא נמצאה"
//             });
//         }

//         // בדיקת הרשאת הורדה
//         if (gallery.allowClientDownload !== true) {
//             return res.status(403).json({
//                 message: "ההורדה אינה מאושרת עבור גלריה זו"
//             });
//         }

//         // רק התמונות שהצלמת שלחה ללקוחה
//         const clientImages = gallery.images.filter(
//             image => image.photographerSelected === true
//         );

//         if (clientImages.length === 0) {
//             return res.status(404).json({
//                 message: "אין תמונות להורדה"
//             });
//         }

//         const zipName =
//             `gallery-${gallery._id}.zip`;

//         res.setHeader(
//             "Content-Type",
//             "application/zip"
//         );

//         res.setHeader(
//             "Content-Disposition",
//             `attachment; filename="${zipName}"`
//         );

//         const archive = archiver("zip", {
//             zlib: { level: 9 }
//         });

//         archive.on("error", (error) => {
//             console.error(
//                 "Client gallery archive error:",
//                 error
//             );

//             if (!res.headersSent) {
//                 res.status(500).end();
//             }
//         });

//         archive.pipe(res);

//         let filesAdded = 0;

//         for (const image of clientImages) {

//             const fileName =
//                 path.basename(image.imageUrl);

//             const filePath =
//                 path.join(
//                     process.cwd(),
//                     "uploads",
//                     fileName
//                 );

//             console.log(
//                 "Checking client gallery file:",
//                 filePath
//             );

//             if (fs.existsSync(filePath)) {

//                 archive.file(
//                     filePath,
//                     {
//                         name:
//                             image.imageName ||
//                             fileName
//                     }
//                 );

//                 filesAdded++;

//             } else {

//                 console.warn(
//                     `File not found: ${filePath}`
//                 );
//             }
//         }

//         if (filesAdded === 0) {
//             return res.status(404).json({
//                 message:
//                     "לא נמצאו קבצי תמונות בשרת"
//             });
//         }

//         await archive.finalize();

//     } catch (error) {

//         console.error(
//             "Download client gallery ZIP error:",
//             error
//         );

//         if (!res.headersSent) {
//             return res.status(500).json({
//                 message:
//                     "שגיאה ביצירת קובץ ZIP",
//                 error:
//                     error.message
//             });
//         }
//     }
// };
// // ======================================================
// // שמירת בחירות הלקוחה
// // ======================================================

// const submitClientSelections = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;
// //////13/10//////
//         // const {
//         //     selectedImageIds,
//         //     ///12/10//
//         //        clientNotes = {}
//         //        //////
//         // } = req.body;
// const {
//     selectedImageIds,
//     clientNotes = {}
// } = req.body;

// if (
//     clientNotes === null ||
//     typeof clientNotes !== "object" ||
//     Array.isArray(clientNotes)
// ) {
//     return res.status(400).json({
//         message: "ההערות שנשלחו אינן תקינות"
//     });
// }
// ///////////////

//         if (
//             !req.client ||
//             req.client.galleryId !== id
//         ) {
//             return res.status(403).json({
//                 message:
//                     "אין הרשאה לגלריה זו"
//             });
//         }

//         if (
//             !Array.isArray(selectedImageIds)
//         ) {
//             return res.status(400).json({
//                 message:
//                     "selectedImageIds חייב להיות מערך"
//             });
//         }
//         ////
//         const uniqueImageIds = new Set(selectedImageIds);

// if (uniqueImageIds.size !== selectedImageIds.length) {
//     return res.status(400).json({
//         message: "נשלחו מזהי תמונות כפולים"
//     });
// }

//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         const photographerSelectedIds =
//             gallery.images
//                 .filter(
//                     image =>
//                         image.photographerSelected
//                 )
//                 .map(
//                     image =>
//                         image._id.toString()
//                 );

//         const invalidIds =
//             selectedImageIds.filter(
//                 selectedId =>
//                     !photographerSelectedIds.includes(
//                         selectedId
//                     )
//             );

//         if (invalidIds.length > 0) {
//             return res.status(400).json({
//                 message:
//                     "נבחרה תמונה שאינה זמינה ללקוחה"
//             });
//         }

//         gallery.images.forEach(
//             image => {

//                 image.clientSelected =
//                     false;

//                 image.selectionOrder =
//                     null;
//             }
//         );

//         // selectedImageIds.forEach(
//         //     (imageId, index) => {

//         //         const image =
//         //             gallery.images.id(
//         //                 imageId
//         //             );

//         //         if (image) {

//         //             image.clientSelected =
//         //                 true;

//         //             image.selectionOrder =
//         //                 index + 1;
//         //         }
//         //     }
//         // );
// //12/10/////

// selectedImageIds.forEach(
//     (imageId, index) => {

//         const image =
//             gallery.images.id(imageId);

//         if (image) {

//             image.clientSelected = true;

//             image.selectionOrder = index + 1;

//             image.clientNote =
//                 typeof clientNotes[imageId] === "string"
//                     ? clientNotes[imageId].trim()
//                     : "";
//         }
//     }
// );
// ///////////
//         gallery.clientSubmitted =
//             true;

//         await gallery.save();

//         const frontendUrl =
//             process.env.FRONTEND_URL ||
//             "http://localhost:5173";

//         const selectionsUrl =
//             `${frontendUrl}/gallery/${gallery._id}/selections`;

//         await transporter.sendMail({

//             from:
//                 process.env.EMAIL_USER,

//             to:
//                 process.env.EMAIL_USER,

//             subject:
//                 `הלקוחה ${gallery.clientName} שלחה בחירות`,

//             html: `
//                 <div dir="rtl">

//                     <h2>
//                         הלקוחה ${gallery.clientName}
//                         שלחה את הבחירות שלה
//                     </h2>

//                     <p>
//                         מספר התמונות שנבחרו:
//                         ${selectedImageIds.length}
//                     </p>

//                     <p>
//                         <a href="${selectionsUrl}">
//                             צפייה בבחירות
//                         </a>
//                     </p>

//                 </div>
//             `
//         });

//         return res.json({

//             message:
//                 "הבחירות נשמרו בהצלחה",

//             selectedCount:
//                 selectedImageIds.length
//         });

//     } catch (error) {

//         console.error(
//             "Submit client selections error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בשמירת הבחירות",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // קבלת בחירות הלקוחה
// // ======================================================

// const getClientSelections = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const gallery =
//             await Gallery
//                 .findById(id)
//                 .select("-clientPassword");

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         const selectedImages =
//             gallery.images
//                 .filter(
//                     image =>
//                         image.clientSelected
//                 )
//                 .sort(
//                     (a, b) =>
//                         a.selectionOrder -
//                         b.selectionOrder
//                 );

//         const imagesWithColor =
//             selectedImages.map(
//                 image => {

//                     const order =
//                         image.selectionOrder;

//                     let selectionColor;
//                     let selectionColorText;

//                     if (
//                         order <=
//                         gallery.maxSelections
//                     ) {

//                         selectionColor =
//                             "green";

//                         selectionColorText =
//                             "בחירה רגילה";

//                     } else if (
//                         order <=
//                         gallery.maxSelections + 3
//                     ) {

//                         selectionColor =
//                             "orange";

//                         selectionColorText =
//                             "3 תמונות נוספות ללא תשלום"

//                     } else {

//                         selectionColor =
//                             "red";

//                         selectionColorText =
//                             "בתוספת תשלום";
//                     }

//                     return {

//                         ...image.toObject(),

//                         selectionColor,

//                         selectionColorText
//                     };
//                 }
//             );

//         return res.json({

//             galleryId:
//                 gallery._id,

//             clientName:
//                 gallery.clientName,

//             maxSelections:
//                 gallery.maxSelections,

//             clientSubmitted:
//                 gallery.clientSubmitted,

//             images:
//                 imagesWithColor
//         });

//     } catch (error) {

//         console.error(
//             "Get client selections error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בטעינת בחירות הלקוחה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // עדכון גלריה
// // ======================================================

// const updateGalleryById = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

       



//         const {
//     clientName,
//     clientEmail,
//     maxSelections,
//     rawPhotosLink,
//     editedPhotosLink,
//     finalDelivered,
//     allowClientDownload,
//     isHidden
// } = req.body;
//         const gallery =
//             await Gallery.findById(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         if (
//             clientName !== undefined
//         ) {
//             gallery.clientName =
//                 clientName;
//         }

//         if (
//             clientEmail !== undefined
//         ) {
//             gallery.clientEmail =
//                 clientEmail;
//         }

//         if (
//             maxSelections !== undefined
//         ) {

//             const max =
//                 Number(maxSelections);

//             if (
//                 !Number.isInteger(max) ||
//                 max < 1
//             ) {
//                 return res.status(400).json({
//                     message:
//                         "מספר הבחירות חייב להיות מספר שלם גדול מ־0"
//                 });
//             }

//             gallery.maxSelections =
//                 max;
//         }

//         if (
//             rawPhotosLink !== undefined
//         ) {
//             gallery.rawPhotosLink =
//                 rawPhotosLink;
//         }

//         if (
//             editedPhotosLink !== undefined
//         ) {
//             gallery.editedPhotosLink =
//                 editedPhotosLink;
//         }

//         if (
//             finalDelivered !== undefined
//         ) {
//             gallery.finalDelivered =
//                 finalDelivered;
//         }
//         if (
//     allowClientDownload !== undefined
// ) {
//     gallery.allowClientDownload =
//         allowClientDownload;
// }
// ////////14/10/////
// if (isHidden !== undefined) {
//     if (typeof isHidden !== "boolean") {
//         return res.status(400).json({
//             message: "ערך ההסתרה חייב להיות true או false"
//         });
//     }

//     gallery.isHidden = isHidden;
// }
// //////////
//         await gallery.save();

//         const result =
//             gallery.toObject();

//         delete result.clientPassword;

//         return res.json({

//             message:
//                 "הגלריה עודכנה בהצלחה",

//             gallery:
//                 result
//         });

//     } catch (error) {

//         console.error(
//             "Update gallery error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה בעדכון הגלריה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // מחיקת גלריה
// // ======================================================

// const deleteGalleryById = async (
//     req,
//     res
// ) => {

//     try {

//         const { id } = req.params;

//         const gallery =
//             await Gallery.findByIdAndDelete(id);

//         if (!gallery) {
//             return res.status(404).json({
//                 message:
//                     "הגלריה לא נמצאה"
//             });
//         }

//         return res.json({
//             message:
//                 "הגלריה נמחקה בהצלחה"
//         });

//     } catch (error) {

//         console.error(
//             "Delete gallery error:",
//             error
//         );

//         return res.status(500).json({
//             message:
//                 "שגיאה במחיקת הגלריה",

//             error:
//                 error.message
//         });
//     }
// };


// // ======================================================
// // ייצוא
// // ======================================================

// module.exports = {

//     createGallery,

//     getAllGalleries,

//     getGalleryForPhotographer,

//     clientLogin,

//     getGalleryForClient,

//     savePhotographerSelections,

//     sendGalleryToClient,
//     downloadClientGalleryZip,

//     submitClientSelections,

//     getClientSelections,

//     updateGalleryById,

//     deleteGalleryById,

//     uploadEditedImages,

//     getEditedImages,

//     sendEditedGalleryToClient,
//     downloadEditedImage,

//     downloadEditedImagesZip,
// };
// ======================================================
// galleryController
// אחסון תמונות: Cloudflare R2 (config/storage.js)
// משתני סביבה: R2_*, ACCESS_TOKEN_SECRET, EMAIL_USER, EMAIL_PASS,
//   FRONTEND_URL (חובה בייצור), NODE_ENV=production
//   אופציונלי: EMAIL_FROM, NOTIFY_EMAIL
// ======================================================

const Gallery = require("../models/Gallery");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const crypto = require("crypto");
const { WATERMARK_PATH } = require("../config/paths");
const storage = require("../config/storage");


require("dotenv").config();

// input: נתיב לקובץ או Buffer. outputName: שם בלבד (קובע את הפורמט).
// מחזירה Buffer של התמונה עם סימן המים.
const addWatermark = async (input, outputName) => {
    
    try {

        if (!fs.existsSync(WATERMARK_PATH)) {
            throw new Error("קובץ הלוגו לא נמצא");
        }

        // .rotate() מיישר לפי EXIF, כך שהמידות נכונות גם בתמונות מהטלפון
        const { data: baseBuffer, info } = await sharp(input)
            .rotate()
            .toBuffer({ resolveWithObject: true });


        // הלוגו גדול: עד 80% מהרוחב ועד 70% מהגובה, תמיד בתוך התמונה.
        // בלי withoutEnlargement כדי שגם לוגו קטן יוגדל לגודל הרצוי.
        const maxWidth = Math.max(1, Math.round(info.width * 0.80));
        const maxHeight = Math.max(1, Math.round(info.height * 0.70));

        // חותכים שוליים שקופים של הלוגו, אחרת הם גורמים לחותמת להיראות "מרחפת" מעל התחתית
        const trimmedLogo = await sharp(WATERMARK_PATH)
            .ensureAlpha()
            .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
            .toBuffer();

        const watermarkBuffer = await sharp(trimmedLogo)
            .resize({
                width: maxWidth,
                height: maxHeight,
                fit: "inside"
            })
            .png()
            .toBuffer();

        const wmInfo = await sharp(watermarkBuffer).metadata();
        const margin = Math.round(Math.min(info.width, info.height) * 0.02);
        const left = margin;
        const top = Math.max(0, info.height - wmInfo.height - margin);

        // שומרים באותו פורמט שהסיומת של קובץ הפלט מציינת
        const ext = path.extname(outputName).toLowerCase();
        let pipeline = sharp(baseBuffer).composite([
            {
                input: watermarkBuffer,
                left,
                top
            }
        ]);

        if (ext === ".png") {
            pipeline = pipeline.png();
        } else if (ext === ".webp") {
            pipeline = pipeline.webp({ quality: 95 });
        } else {
            pipeline = pipeline.jpeg({ quality: 95 });
        }

        const resultBuffer = await pipeline.toBuffer();

        return resultBuffer;
    } catch (error) {
        console.error("WATERMARK ERROR:", error);
        throw error;
    }
};
// ======================================================
// פונקציות עזר להעלאות
// ======================================================

// מוחק את הקבצים הזמניים של multer כשהבקשה מסתיימת (בהצלחה או בשגיאה)
const cleanupTempFiles = (req, res) => {
    res.on("close", () => {
        for (const file of req.files || []) {
            fs.unlink(file.path, () => {});
        }
    });
};

// הרצת פעולות אסינכרוניות עם הגבלת מקביליות, ושמירה על הסדר
const mapWithConcurrency = async (items, limit, worker) => {
    const results = new Array(items.length);
    let next = 0;

    const runners = Array.from(
        { length: Math.min(limit, items.length) },
        async () => {
            while (next < items.length) {
                const index = next++;
                results[index] = await worker(items[index], index);
            }
        }
    );

    await Promise.all(runners);
    return results;
};

// ======================================================
// יצירת סיסמה אקראית
// ======================================================

// סיסמה אקראית מאובטחת (crypto), בלי תווים שקל להתבלבל בהם (0/O, 1/l/I)
const PASSWORD_CHARS =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRandomPassword = (length = 10) => {
    let password = "";

    for (let i = 0; i < length; i++) {
        password += PASSWORD_CHARS[crypto.randomInt(PASSWORD_CHARS.length)];
    }

    return password;
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

// השולחת, והכתובת שמקבלת התראות כשלקוחה שולחת בחירות
const MAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER;

// הגנה מהזרקת HTML מתוך שם הלקוחה בתוך המייל
const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

// כתובת האתר לקישורים במיילים. בייצור חייבת להיות מוגדרת.
const getFrontendUrl = () => {
    const url = process.env.FRONTEND_URL;

    if (url) {
        return url.replace(/\/+$/, "");
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("FRONTEND_URL לא מוגדר בשרת");
    }

    return "http://localhost:5173";
};

// בייצור לא חושפים הודעות שגיאה פנימיות ללקוח
const errorDetail = (error) =>
    process.env.NODE_ENV === "production" ? undefined : error.message;


// ======================================================
// יצירת גלריה
// ======================================================

const createGallery = async (req, res) => {
    cleanupTempFiles(req, res);

    const uploadedKeys = [];
    let persisted = false;

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

        // העלאת התמונות המקוריות ל-R2 (עד 4 במקביל)
        const images = await mapWithConcurrency(
            req.files,
            4,
            async (file) => {
                const key = storage.newKey(file.originalname);

                await storage.uploadFile(
                    key,
                    file.path,
                    file.mimetype
                );

                uploadedKeys.push(key);

                return {
                    imageUrl: storage.publicUrl(key),
                    imageName: file.originalname,
                    watermarked: false,
                    photographerSelected: false,
                    clientSelected: false,
                    selectionOrder: null
                };
            }
        );

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

        persisted = true;

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

        // אם היצירה נכשלה, לא משאירים תמונות יתומות בענן
        if (!persisted) {
            await storage.deleteKeys(uploadedKeys).catch(() => {});
        }

        return res.status(500).json({
            message:
                "שגיאה ביצירת הגלריה",

            error: errorDetail(error)
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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
                const originalKey = storage.keyFromUrl(image.imageUrl);
                const watermarkedKey = storage.watermarkedKey(originalKey);

                const originalBuffer =
                    await storage.getObjectBuffer(originalKey);

                const watermarkedBuffer = await addWatermark(
                    originalBuffer,
                    originalKey
                );

                await storage.uploadBuffer(
                    watermarkedKey,
                    watermarkedBuffer,
                    storage.contentTypeFor(originalKey)
                );

                image.watermarkedImageUrl =
                    storage.publicUrl(watermarkedKey);

                image.watermarked = true;

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

        const frontendUrl = getFrontendUrl();

        const galleryUrl =
            `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

        // שליחת המייל ללקוחה
        await transporter.sendMail({
            from: MAIL_FROM,
            to: gallery.clientEmail,
            subject: "הגלריה שלך מוכנה לצפייה",

            html: `
                <div dir="rtl">
                    <h2>שלום ${escapeHtml(gallery.clientName)}</h2>

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
            error: errorDetail(error)
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

    const frontendUrl = getFrontendUrl();

    // הקישור דורש התחברות מחדש
    const galleryUrl =
        `${frontendUrl}/client/gallery/${gallery._id}?login=required`;

    await transporter.sendMail({

        from: MAIL_FROM,

        to:
            gallery.clientEmail,

        subject:
            "התמונות הערוכות שלך מוכנות",

        html: `
            <div dir="rtl">

                <h2>
                    שלום ${escapeHtml(gallery.clientName)}
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

    cleanupTempFiles(req, res);

    const uploadedKeys = [];
    let persisted = false;

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

        const newEditedImages = [];

        for (const file of req.files) {
            const key = storage.newKey(file.originalname);
            const watermarkedKey = storage.watermarkedKey(key);

            // סימן מים נוצר מהקובץ הזמני, לפני ההעלאה
            const watermarkedBuffer = await addWatermark(
                file.path,
                key
            );

            await storage.uploadFile(key, file.path, file.mimetype);
            uploadedKeys.push(key);

            await storage.uploadBuffer(
                watermarkedKey,
                watermarkedBuffer,
                storage.contentTypeFor(key)
            );
            uploadedKeys.push(watermarkedKey);

            newEditedImages.push({
                imageUrl: storage.publicUrl(key),
                watermarkedImageUrl: storage.publicUrl(watermarkedKey),
                imageName: file.originalname
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

        persisted = true;

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

        // כשל לפני השמירה: מוחקים מהענן את מה שכבר עלה
        if (!persisted) {
            await storage.deleteKeys(uploadedKeys).catch(() => {});
        }

        return res.status(500).json({
            message:
                "שגיאה בהעלאת התמונות הערוכות",

            error: errorDetail(error)
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

            error: errorDetail(error)
        });
    }
};

// ======================================================
// עזר: הוספת קובץ מהענן ל-ZIP (אחד אחרי השני, בלי לפתוח הכול במקביל)
// ======================================================

const appendFromStorage = async (archive, key, name) => {
    const body = await storage.getObjectStream(key);

    await new Promise((resolve, reject) => {
        const cleanup = () => {
            archive.removeListener("entry", onEntry);
            archive.removeListener("error", onError);
        };
        const onEntry = () => {
            cleanup();
            resolve();
        };
        const onError = (error) => {
            cleanup();
            reject(error);
        };

        archive.on("entry", onEntry);
        archive.on("error", onError);
        body.on("error", onError);

        archive.append(body, { name });
    });
};

// ======================================================
// הורדת תמונה ערוכה בודדת
// ======================================================

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

        const key = storage.keyFromUrl(selectedUrl);

        let body;

        try {
            body = await storage.getObjectStream(key);
        } catch (error) {
            if (storage.isNotFound(error)) {
                return res.status(404).json({
                    message: "קובץ התמונה לא נמצא"
                });
            }
            throw error;
        }

        // attachment מטפל נכון גם בשמות קבצים בעברית
        res.attachment(image.imageName || path.basename(key));

        body.on("error", (error) => {
            console.error("Download stream error:", error);
            res.destroy(error);
        });

        body.pipe(res);

    } catch (error) {
        console.error(
            "שגיאה בהורדת תמונה ערוכה:",
            error
        );

        if (!res.headersSent) {
            res.status(500).json({
                message: "שגיאה בהורדת התמונה"
            });
        }
    }
};

// ======================================================
// בניית ZIP מרשימת תמונות (משותף לשני ה-ZIP)
// ======================================================

const streamZip = async (res, zipName, items, logLabel) => {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${zipName}"`
    );

    // תמונות כבר דחוסות, ולכן store (בלי דחיסה) חוסך עומס על השרת
    const archive = archiver("zip", { store: true });

    archive.on("error", (error) => {
        console.error(`${logLabel} archive error:`, error);

        if (!res.headersSent) {
            res.status(500).end();
        }
    });

    archive.pipe(res);

    let filesAdded = 0;

    for (const item of items) {
        try {
            await appendFromStorage(archive, item.key, item.name);
            filesAdded++;
        } catch (error) {
            console.warn(
                `${logLabel}: לא ניתן להוסיף ${item.key}:`,
                error.message
            );
        }
    }

    if (filesAdded === 0) {
        archive.abort();

        if (!res.headersSent) {
            return res.status(404).json({
                message: "לא נמצאו קבצי תמונות בשרת"
            });
        }

        return res.end();
    }

    await archive.finalize();
};

// ======================================================
// הורדת כל התמונות הערוכות כ־ZIP
// ======================================================

const downloadEditedImagesZip = async (req, res) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).json({
                message: "הגלריה לא נמצאה"
            });
        }

        if (
            !gallery.editedImages ||
            gallery.editedImages.length === 0
        ) {
            return res.status(404).json({
                message: "אין תמונות ערוכות להורדה"
            });
        }

        const withWatermark =
            req.query.watermark === "true";

        const items = gallery.editedImages.map((image) => {
            const selectedUrl =
                withWatermark
                    ? image.watermarkedImageUrl || image.imageUrl
                    : image.imageUrl;

            const key = storage.keyFromUrl(selectedUrl);

            return {
                key,
                name: image.imageName || path.basename(key)
            };
        });

        await streamZip(
            res,
            `edited-gallery-${gallery._id}.zip`,
            items,
            "Edited ZIP"
        );

    } catch (error) {
        console.error("Download ZIP error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "שגיאה ביצירת קובץ ZIP",
                error: errorDetail(error)
            });
        }
    }
};

// ======================================================
// הורדת כל התמונות שהצלמת שלחה ללקוחה כ־ZIP
// ======================================================

const downloadClientGalleryZip = async (req, res) => {
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

        const items = clientImages.map((image) => {
            const key = storage.keyFromUrl(image.imageUrl);

            return {
                key,
                name: image.imageName || path.basename(key)
            };
        });

        await streamZip(
            res,
            `gallery-${gallery._id}.zip`,
            items,
            "Client gallery ZIP"
        );

    } catch (error) {
        console.error(
            "Download client gallery ZIP error:",
            error
        );

        if (!res.headersSent) {
            return res.status(500).json({
                message: "שגיאה ביצירת קובץ ZIP",
                error: errorDetail(error)
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

        const frontendUrl = getFrontendUrl();

        const selectionsUrl =
            `${frontendUrl}/gallery/${gallery._id}/selections`;

        await transporter.sendMail({

            from: MAIL_FROM,

            to: NOTIFY_EMAIL,

            subject:
                `הלקוחה ${gallery.clientName} שלחה בחירות`,

            html: `
                <div dir="rtl">

                    <h2>
                        הלקוחה ${escapeHtml(gallery.clientName)}
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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

            error: errorDetail(error)
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

        // מחיקת הקבצים מהענן (ברקע; כשל כאן לא מבטל את המחיקה)
        const keys = new Set();

        const addUrl = (url) => {
            if (url) keys.add(storage.keyFromUrl(url));
        };

        for (const image of gallery.images || []) {
            addUrl(image.imageUrl);
            addUrl(image.watermarkedImageUrl);
        }

        for (const image of gallery.editedImages || []) {
            addUrl(image.imageUrl);
            addUrl(image.watermarkedImageUrl);
        }

        storage.deleteKeys([...keys]).catch((error) => {
            console.error("R2 cleanup error:", error);
        });

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

            error: errorDetail(error)
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