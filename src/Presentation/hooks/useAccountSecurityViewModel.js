import { useMemo, useState } from 'react'
import { changePassword } from '../../application/auth/authService'

const passwordRules = (password) => [
  {
    id: 'len',
    label: 'Must be at least 8 characters long',
    met: password.length >= 8,
  },
  {
    id: 'upper',
    label: 'Must contain at least one uppercase letter',
    met: /[A-Z]/.test(password),
  },
  {
    id: 'num',
    label: 'Must contain at least one number',
    met: /[0-9]/.test(password),
  },
]

export const useAccountSecurityViewModel = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const rules = useMemo(() => passwordRules(newPassword), [newPassword])
  const allRulesMet = rules.every((r) => r.met)

  const submitChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    if (!allRulesMet) {
      setError('New password does not meet all requirements')
      return
    }

    setLoading(true)
    try {
      const { message } = await changePassword({ currentPassword, newPassword })
      setSuccessMessage(message || 'Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    rules,
    allRulesMet,
    loading,
    error,
    successMessage,
    submitChangePassword,
  }
}
