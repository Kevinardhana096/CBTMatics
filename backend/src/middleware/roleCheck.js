// Middleware untuk Role-Based Access Control (RBAC)

// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

// Specific role checks
const isAdmin = checkRole('admin');
const isTeacher = checkRole('admin', 'teacher');
const isStudent = checkRole('student');

module.exports = {
    checkRole,
    isAdmin,
    isTeacher,
    isStudent
};
