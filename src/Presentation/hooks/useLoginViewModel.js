import { useMemo, useState } from 'react'
import { loginUser, registerUser } from '../../Application/auth/authService'

const initialForm = {
  identifier: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
}

export const useLoginViewModel = () => {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const roles = useMemo(() => [{ id: 'user', name: 'user' }], [])
  const rolesLoading = false

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (isLogin) => {
    setLoading(true)
    setError(null)
    setSuccessMessage('')

    try {
      if (isLogin) {
        // Simple Login Validation
        if (!form.identifier || !form.password) {
           throw new Error("Please fill in all fields");
        }

        const response = await loginUser({
          identifier: form.identifier,
          password: form.password,
        })
        setSuccessMessage(response?.message || 'Login successful')
        return response
      } else {
        // Registration Validation
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        const response = await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
        })

        setSuccessMessage(response?.message || 'Registered successfully')
        return response
      }
    } catch (err) {
      const msg =
        err?.payload?.message ||
        err?.payload?.error?.message ||
        err.message ||
        'Something went wrong'
      setError(new Error(msg))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    roles,
    rolesLoading,
    loading,
    error,
    successMessage,
    setIdentifier: setField('identifier'),
    setUsername: setField('username'),
    setEmail: setField('email'),
    setPassword: setField('password'),
    setRole: setField('role'),
    setConfirmPassword: setField('confirmPassword'),
    resetForm: () => setForm(initialForm), // Added a helper to clear inputs
    submit,
  }
}