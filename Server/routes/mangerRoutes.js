// // const express = require("express")
// // const router = express.Router()
// // const managerController = require("../controllers/managerController")
// // const verifyJWT = require("../middleware/verifyJWT")

// // // נתיבים ציבוריים (ללא טוקן)
// // router.post("/register", managerController.register)
// // router.post("/login", managerController.login)

// // // כל הנתיבים מכאן והילך דורשים אימות (טוקן)
// // router.use(verifyJWT)

// // router.get("/", managerController.getAllManagers)
// // router.get("/:id", managerController.getManagerById)
// // router.put("/:id", managerController.updateManager)
// // router.delete("/:id", managerController.deleteManager)

// // module.exports = router
// const express = require("express");
// const router = express.Router();

// const managerController = require("../controllers/managerController");
// const verifyJWT = require("../middleware/verifyJWT");
// const requireSuperAdmin = require("../middleware/requireSuperAdmin");

// // התחברות נשארת פתוחה
// router.post("/login", managerController.login);

// // כל הנתיבים הבאים דורשים התחברות
// router.use(verifyJWT);

// // רק מנהלת ראשית יכולה להוסיף מנהלים
// router.post(
//     "/register",
//     requireSuperAdmin,
//     managerController.register
// );

// // פעולות ניהול מנהלים — למנהלת הראשית בלבד
// router.get("/", requireSuperAdmin, managerController.getAllManagers);
// router.get("/:id", requireSuperAdmin, managerController.getManagerById);
// router.put("/:id", requireSuperAdmin, managerController.updateManager);
// router.delete("/:id", requireSuperAdmin, managerController.deleteManager);

// module.exports = router;
// const express = require("express")
// const router = express.Router()
// const managerController = require("../controllers/managerController")
// const verifyJWT = require("../middleware/verifyJWT")

// // נתיבים ציבוריים (ללא טוקן)
// router.post("/register", managerController.register)
// router.post("/login", managerController.login)

// // כל הנתיבים מכאן והילך דורשים אימות (טוקן)
// router.use(verifyJWT)

// router.get("/", managerController.getAllManagers)
// router.get("/:id", managerController.getManagerById)
// router.put("/:id", managerController.updateManager)
// router.delete("/:id", managerController.deleteManager)

// module.exports = router
const express = require("express");
const router = express.Router();

const managerController = require("../controllers/managerController");
const verifyJWT = require("../middleware/verifyJWT");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

// התחברות נשארת פתוחה
router.post("/login", managerController.login);

// כל הנתיבים הבאים דורשים התחברות
router.use(verifyJWT);

// בדיקת טוקן + פרטי המנהלת המחוברת (פתוח לכל מנהלת)
router.get("/me", (req, res) => res.json(req.manager));

// רק מנהלת ראשית יכולה להוסיף מנהלים
router.post(
    "/register",
    requireSuperAdmin,
    managerController.register
);

// פעולות ניהול מנהלים — למנהלת הראשית בלבד
router.get("/", requireSuperAdmin, managerController.getAllManagers);
router.get("/:id", requireSuperAdmin, managerController.getManagerById);
router.put("/:id", requireSuperAdmin, managerController.updateManager);
router.delete("/:id", requireSuperAdmin, managerController.deleteManager);

module.exports = router;