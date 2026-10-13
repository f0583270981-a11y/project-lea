const mongoose = require("mongoose")

const ManagerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
    type: String,
    enum: ["superadmin", "manager"],
    default: "manager"
}
}, {
    timestamps: true
})

module.exports = mongoose.model('Manager', ManagerSchema)