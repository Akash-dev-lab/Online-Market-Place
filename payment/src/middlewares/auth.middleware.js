const jwt = require("jsonwebtoken");


function createAuthMiddleware(roles = ["user"]) {
    return function authMiddleware(req, res, next) {
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "testsecret");

            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden: Insufficient rights" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    }
}

module.exports = createAuthMiddleware;