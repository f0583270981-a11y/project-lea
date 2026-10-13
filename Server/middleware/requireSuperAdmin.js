const requireSuperAdmin = (req, res, next) => {
    if (req.manager?.role !== "superadmin") {
        return res.status(403).json({
            message: "אין הרשאה לבצע פעולה זו"
        });
    }

    next();
};

module.exports = requireSuperAdmin;