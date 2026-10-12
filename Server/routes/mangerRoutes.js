const express = require("express")
const router = express.Router()
const managerController = require("../controllers/managerController")
const verifyJWT = require("../middleware/verifyJWT")

// נתיבים ציבוריים (ללא טוקן)
router.post("/register", managerController.register)
router.post("/login", managerController.login)

// כל הנתיבים מכאן והילך דורשים אימות (טוקן)
router.use(verifyJWT)

router.get("/", managerController.getAllManagers)
router.get("/:id", managerController.getManagerById)
router.put("/:id", managerController.updateManager)
router.delete("/:id", managerController.deleteManager)

module.exports = router