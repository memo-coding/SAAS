/**
 * System role definitions
 */
const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  USER: 'User'
};

/**
 * Role hierarchy and permissions
 * Higher index means more permissions
 */
const ROLE_HIERARCHY = [
  ROLES.USER,
  ROLES.TEACHER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN
];

/**
 * Check if a role has permission over another role
 * @param {string} role - The role checking permissions
 * @param {string} targetRole - The role being checked against
 * @returns {boolean}
 */
const hasRolePermission = (role, targetRole) => {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(targetRole);
};

/**
 * Get all valid roles
 * @returns {string[]}
 */
const getAllRoles = () => Object.values(ROLES);

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  hasRolePermission,
  getAllRoles
};