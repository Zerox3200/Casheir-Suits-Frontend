import { Navigate, Outlet } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import { getAuthUser } from '../helpers/cookies'
import { getHomePathForRole } from '../helpers/roles'

/** Blocks non-admin users (e.g. cashiers) from admin-only screens. */
export default function RequireAdmin() {
  const user = getAuthUser()

  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />
  }

  return <Outlet />
}
