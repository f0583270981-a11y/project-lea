const jwt=require("jsonwebtoken")
const { model } = require("mongoose")
const verifyJWT=(req,res,next)=>{
const authHeader = req.headers.authorization ||
req.headers.Authorization
if (!authHeader?.startsWith('Bearer ')) {
return res.status(401).json({ message: 'Unauthorized' })

}
const token = authHeader.split(' ')[1]

jwt.verify(
  token,
  process.env.ACCESS_TOKEN_SECRET,
  (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (decoded.type !== "manager") {
      return res.status(403).json({ message: "Forbidden" })
    }

    req.manager = decoded;
    next()
  }
)
}
module.exports=verifyJWT