const Manager = require("../models/Manager")
const manager = require("../models/Manager")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const register = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                message: "נא למלא שם משתמש וסיסמה"
            })
        }

        const ifManger = await Manager.findOne({ username })

        if (ifManger) {
            return res.status(409).json({
                message: "שם המשתמש כבר קיים במערכת"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newManager = await Manager.create({
            username,
            password: hashedPassword
        })

        return res.status(201).json({
            message: "המנהל נוצר בהצלחה",
            manager: {
                _id: newManager._id,
                username: newManager.username
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: "שגיאת שרת",
            error: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        const foundUser = await Manager.findOne({ username })
        if (!foundUser) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const match = await bcrypt.compare(password, foundUser.password)
        if (!match) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

      const mangerInfo = { 
    _id: foundUser.id, 
    username: foundUser.username,
    type: "manager"
}
        const accessToken = jwt.sign(mangerInfo, process.env.ACCESS_TOKEN_SECRET)
        return res.status(200).json({ accessToken })
    } catch (error) {
        res.status(500).json({ message: "שגיאת שרת", error: error.message })
    }
}
//קבלת כל המנהלים
const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find().select("-password").lean()
        if (!managers?.length) {
            return res.status(404).json({ message: "No managers found" })
        }
        return res.json(managers)
    } catch (error) {
        return res.status(500).json({ message: "שגיאת שרת", error: error.message })
    }
}
//קבלת מנהל לפי id
// קבלת מנהל לפי ID (GET)
const getManagerById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: 'Manager ID is required' })
        }

        const manager = await Manager.findById(id).select("-password").lean()
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' })
        }

        return res.json(manager)
    } catch (error) {
        return res.status(500).json({ message: "שגיאת שרת", error: error.message })
    }
}
//עדכון מנהל
const updateManager = async (req, res) => {
    try {
        const { id } = req.params
        const { username, password } = req.body

        if (!id) {
            return res.status(400).json({ message: 'Manager ID is required' })
        }

        const manager = await Manager.findById(id).exec()
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' })
        }

        if (username) manager.username = username
        if (password) {
            manager.password = await bcrypt.hash(password, 10)
        }

        const updatedManager = await manager.save()
        return res.json({ message: `Manager ${updatedManager.username} updated successfully` })
    } catch (error) {
        return res.status(500).json({ message: "שגיאת שרת", error: error.message })
    }
}
//מחיקת מנהל
const deleteManager = async (req, res) => {
    try {

        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: 'Manager ID required' })
        }

        const manager = await Manager.findById(id).exec()
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' })
        }

        const result = await manager.deleteOne()
        return res.json({ message: `Manager ${result.username} deleted successfully` })
    } catch (error) {
        return res.status(500).json({ message: "שגיאת שרת", error: error.message })
    }
}
module.exports = {
    register,
    login,
    getAllManagers,
    getManagerById,
    updateManager,
    deleteManager
}