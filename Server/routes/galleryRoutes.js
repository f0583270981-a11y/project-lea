// // const express = require("express")
// // const router = express.Router()
// // const galleryController = require("../controllers/galleryController")
// // const verifyJWT = require("../middleware/verifyJWT")
// // const upload = require("../middleware/multer")


// // router.post("/", verifyJWT, upload.array("images", 1000), galleryController.createGallery)
// // router.get("/", galleryController.getAllGalleries)
// // router.put("/", verifyJWT, galleryController.updateGalleryById)
// // // נתיבים ספציפיים קודם
// // router.post("/:id/selections", galleryController.submitClientSelections)
// // router.patch("/select-image/:galleryId", galleryController.toggleImageSelection)

// // router.post("/:id/send-email", verifyJWT, galleryController.sendGalleryEmail)

// // // נתיבי גלריה כלליים ודינמיים
// // //router.get("/", galleryController.getAllGalleries)
// // router.get("/:id", galleryController.galleriesbyId)
// // //router.post("/", verifyJWT, upload.array("images", 20), galleryController.createGallery)
// // //router.put("/", verifyJWT, galleryController.updateGalleryById)
// // router.delete("/:id", verifyJWT, galleryController.deleteGalleryById)

// // module.exports = router


// const express = require("express")
// const router = express.Router()
// const galleryController = require("../controllers/galleryController")
// const verifyJWT = require("../middleware/verifyJWT")
// const upload = require("../middleware/multer")

// // נתיבי ניהול כלליים של צלמת
// router.post("/", verifyJWT, upload.array("images", 1000), galleryController.createGallery)
// router.get("/", galleryController.getAllGalleries)
// router.put("/", verifyJWT, galleryController.updateGalleryById)

// // נתיבים ספציפיים לבחירות (צלמת ולקוחה)
// router.post("/:id/photographer-selections", verifyJWT, galleryController.savePhotographerSelections)
// router.post("/:id/selections", galleryController.submitClientSelections)

// router.patch("/select-image/:galleryId", galleryController.toggleImageSelection)
// router.post("/:id/send-email", verifyJWT, galleryController.sendGalleryEmail)

// // נתיבי גלריה דינמיים (חייבים להישאר בסוף!)
// router.get("/:id", galleryController.galleriesbyId)
// router.delete("/:id", verifyJWT, galleryController.deleteGalleryById)

// module.exports = router






const express = require("express");
const router = express.Router();

const galleryController = require("../controllers/galleryController");

const verifyJWT = require("../middleware/verifyJWT");
const verifyClientJWT = require("../middleware/verifyClientJWT");

const upload = require("../middleware/multer");


// =====================================================
// צלמת - ניהול גלריות
// =====================================================

// יצירת גלריה + העלאת תמונות
router.post(
    "/",
    verifyJWT,
    upload.array("images", 1000),
    galleryController.createGallery
);


// קבלת כל הגלריות
router.get(
    "/",
    verifyJWT,
    galleryController.getAllGalleries
);


// =====================================================
// לקוחה - התחברות
// =====================================================

// התחברות עם סיסמת הלקוחה
router.post(
    "/:id/client-login",
    galleryController.clientLogin
);


// =====================================================
// לקוחה - צפייה ובחירות
// =====================================================

// קבלת הגלריה לאחר התחברות
router.get(
    "/:id/client-view",
    verifyClientJWT,
    galleryController.getGalleryForClient
);
// הורדת כל התמונות שהצלמת שלחה ללקוחה כ־ZIP
router.get(
    "/:id/client-gallery-download",
    verifyClientJWT,
    galleryController.downloadClientGalleryZip
);

// שמירת בחירות הלקוחה
router.post(
    "/:id/client-selections",
    verifyClientJWT,
    galleryController.submitClientSelections
)

router.post(
    "/:id/edited-images",
    verifyJWT,
    upload.array("editedImages", 1000),
    galleryController.uploadEditedImages
);

router.get(
    "/:id/edited",
    verifyJWT,
    galleryController.getEditedImages
)


// =====================================================
// צלמת - גלריה
// =====================================================
router.get(
    "/:id/edited-download",
    verifyClientJWT,
    galleryController.downloadEditedImagesZip
)
router.get(
    "/:id/edited-image/:imageId/download",
    verifyClientJWT,
    galleryController.downloadEditedImage
);
// קבלת גלריה מלאה
router.get(
    "/:id",
    verifyJWT,
    galleryController.getGalleryForPhotographer
);


// בחירת התמונות שהצלמת שולחת ללקוחה
router.post(
    "/:id/photographer-selection",
    verifyJWT,
    galleryController.savePhotographerSelections
);


// שמירת הבחירה + שליחת מייל ללקוחה
router.post(
    "/:id/send-to-client",
    verifyJWT,
    galleryController.sendGalleryToClient
);


// קבלת התמונות שהלקוחה בחרה
router.get(
    "/:id/client-selections",
    verifyJWT,
    galleryController.getClientSelections
);


// עדכון פרטי הגלריה
router.put(
    "/:id",
    verifyJWT,
    galleryController.updateGalleryById
);


// מחיקת גלריה
router.delete(
    "/:id",
    verifyJWT,
    galleryController.deleteGalleryById
);


module.exports = router
