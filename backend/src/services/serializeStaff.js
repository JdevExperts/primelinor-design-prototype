function serializeStaffUser(staffUser) {
  return {
    id: staffUser.id,
    name: staffUser.name,
    email: staffUser.email,
    role: staffUser.role,
    active: staffUser.active,
    lastLoginAt: staffUser.lastLoginAt,
  };
}

module.exports = { serializeStaffUser };
