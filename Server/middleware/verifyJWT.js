// const jwt=require("jsonwebtoken")
// const { model } = require("mongoose")
// const verifyJWT=(req,res,next)=>{
// const authHeader = req.headers.authorization ||
// req.headers.Authorization
// if (!authHeader?.startsWith('Bearer ')) {
// return res.status(401).json({ message: 'Unauthorized' })

// }
// const token = authHeader.split(' ')[1]

// jwt.verify(
//   token,
//   process.env.ACCESS_TOKEN_SECRET,
//   (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Forbidden' })
//     }

//     if (decoded.type !== "manager") {
//       return res.status(403).json({ message: "Forbidden" })
//     }

//     req.manager = decoded;
//     next()
//   }
// )
// }
// module.exports=verifyJWT

const jwt = require("jsonwebtoken");
const Manager = require("../models/Manager");

const verifyJWT = async (req, res, next) => {
    const authHeader =
        req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        if (decoded.type !== "manager" || !decoded._id) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        // טעינת פרטי המנהל העדכניים ממסד הנתונים
        const manager = await Manager.findById(decoded._id)
            .select("_id username role")
            .lean();

        if (!manager) {
            return res.status(401).json({
                message: "Manager not found"
            });
        }

        // שמירת הפרטים העדכניים לשימוש בנתיבים המוגנים
        req.manager = manager;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = verifyJWT;
