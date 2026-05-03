import { createAuthRepositoryContract } from '../../domain/auth/authRepository'
import {
  validateLoginInput,
  validateRegisterInput,
} from '../../domain/auth/authValidators'
import { createAuthApiRepository } from '../../infrastructure/auth/authApiRepository'

const authRepository = createAuthRepositoryContract(createAuthApiRepository())

export const registerUser = async ({ username, email, password }) => {
  validateRegisterInput({ username, email, password })
  return authRepository.register({ username, email, password })
}

export const loginUser = async ({ identifier, password }) => {
  validateLoginInput({ identifier, password })
  return authRepository.login({ identifier, password })
}

export const fetchCurrentUser = async () => authRepository.me()

export const logoutUser = async () => authRepository.logout()

export const changePassword = async ({ currentPassword, newPassword }) => {
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw new Error('Please enter your current and new password')
  }
  return authRepository.changePassword({ currentPassword, newPassword })
}

export const deleteAccount = async () => authRepository.deleteAccount()
