// The one User field set that is ever allowed to leave apps/api —
// passwordHash must never be selected into memory for a response. Shared by
// CustomAuthGuard (attaches req.user on every authenticated request) and
// UsersService (the admin user-management surface) so the two can never
// silently diverge on what "safe" means.
export const SAFE_USER_SELECT = {
  id: true,
  role: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;
