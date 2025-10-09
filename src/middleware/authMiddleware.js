import permissions from "../utils/permission.js";

// Ensure the request is from an authenticated user (Passport session)
export function ensureAuthenticated(req, res, next) {
    // Prefer Passport's helper when available
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        return next();
    }
    // Fallback: if user is attached by any upstream auth logic
    if (req.user) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
}

// Internal helper to resolve permissions from user's role(s)
function resolveUserPermissions(user) {
    if (!user) return [];
    const { role } = user; // current model uses single role string

    // If in future you migrate to roles: string[], support both gracefully
    if (Array.isArray(role)) {
        const union = new Set();
        for (const r of role) {
            for (const p of (permissions[r] || [])) union.add(p);
        }
        return Array.from(union);
    }
    return permissions[role] || [];
}

// Authorize by required permission name from the permissions map
export function authorize(requiredPermission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userPermissions = resolveUserPermissions(req.user);
        if (userPermissions.includes(requiredPermission)) {
            return next();
        }
        return res.status(403).json({ message: 'Forbidden: You lack the required permission.' });
    };
}
