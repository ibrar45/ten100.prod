import { changePassword, deleteAccount, fetchCurrentUser, loginUser, logoutUser, registerUser } from '../../application/auth/authService'

export const authApi = {
  register: (payload) => registerUser(payload),
  login: (payload) => loginUser(payload),
  me: () => fetchCurrentUser(),
  logout: () => logoutUser(),
  changePassword: (payload) => changePassword(payload),
  deleteAccount: () => deleteAccount(),
}
