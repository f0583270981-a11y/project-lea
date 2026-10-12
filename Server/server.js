const express=require("express")
const cors=require("cors")
const corsOptions=require("./config/corsOptions")
const mongoose=require("mongoose")

const connectDB=require("./config/connectDB")
require("dotenv").config()
const { log } = require("node:console")
const PORT=process.env.PORT || 2005

const app=express()
connectDB()
app.use(cors(corsOptions))
app.use(express.json())
app.use('/uploads', express.static('uploads'));


app.use("/api/galleries", require("./routes/galleryRoutes"))
app.use("/api/manger",require("./routes/mangerRoutes"))
mongoose.connection.once('open',()=>{
    console.log('Connected to MongoDB')
    mongoose.connection.on('error',err=>{
        console.log(err)
        
    })
})
 app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
