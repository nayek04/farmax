export function dashboardPathForRole(role) {
  if (role === 'farmer' || role === 'admin') return '/farmer-dashboard'
  return '/customer-dashboard'
}

