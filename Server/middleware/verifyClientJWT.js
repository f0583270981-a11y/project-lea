// const Gallery = require("../models/Gallery");

// const verifyClientJWT = async (req, res, next) => {
//     try {
//         const galleryId = req.params.id;

//         if (!galleryId) {
//             return res.status(400).json({
//                 message: "Gallery ID is required"
//             });
//         }

//         const gallery = await Gallery.findById(galleryId);

//         if (!gallery) {
//             return res.status(404).json({
//                 message: "הגלריה לא נמצאה"
//             });
//         }

//         req.gallery = gallery;

//         next();

//     } catch (error) {
//         console.error("Client authentication error:", error);

//         return res.status(500).json({
//             message: "שגיאת שרת",
//             error: error.message
//         });
//     }
// };

// module.exports = verifyClientJWT;


const jwt = require("jsonwebtoken");

const verifyClientJWT = (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization ||
            req.headers.Authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "נדרשת התחברות"
            });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {

                if (err) {
                    return res.status(403).json({
                        message: "הטוקן אינו תקין או שפג תוקפו"
                    });
                }

                // חייב להיות טוקן של לקוחה
                if (decoded.type !== "client") {
                    return res.status(403).json({
                        message: "אין הרשאה"
                    });
                }

                // הטוקן שייך לגלריה שביקשו
                if (
                    decoded.galleryId !== req.params.id
                ) {
                    return res.status(403).json({
                        message: "אין הרשאה לגלריה זו"
                    });
                }

                req.client = decoded;

                next();
            }
        );

    } catch (error) {
        console.error("Client JWT error:", error);

        return res.status(500).json({
            message: "שגיאת שרת",
            error: error.message
        });
    }
};

module.exports = verifyClientJWT