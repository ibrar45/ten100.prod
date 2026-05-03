export const validateRegisterInput = ({ username, email, password }) => {
  if (!username?.trim()) throw new Error('Username is required')
  if (!email?.trim()) throw new Error('Email is required')
  if (!password) throw new Error('Password is required')
  if (password.length < 8) throw new Error('Password must be at least 8 characters')
}

export const validateLoginInput = ({ identifier, password }) => {
  if (!identifier?.trim()) throw new Error('Email or username is required')
  if (!password) throw new Error('Password is required')
}
