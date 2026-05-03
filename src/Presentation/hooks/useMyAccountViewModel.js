import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAccount, logoutUser } from '../../application/auth/authService'
import { fetchProfileMe, updateProfile } from '../../features/profile'
import { useAuth } from '../../shared/context/useAuth'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneLocal: '',
  gender: '',
  dateOfBirth: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
}

const phoneToLocal = (phoneNumber) => {
  if (!phoneNumber) return ''
  const p = String(phoneNumber).trim()
  if (p.startsWith('+92')) return p.slice(3).replace(/\s/g, '')
  if (p.startsWith('92') && p.length > 2) return p.slice(2).replace(/\s/g, '')
  return p.replace(/^\+/, '').replace(/\s/g, '')
}

const localToE164 = (local) => {
  const d = (local || '').replace(/\D/g, '')
  if (!d) return ''
  return `+92${d}`
}

const applyProfile = (p) => ({
  firstName: p?.profile?.firstName ?? '',
  lastName: p?.profile?.lastName ?? '',
  email: p?.email ?? '',
  phoneLocal: phoneToLocal(p?.profile?.phoneNumber),
  gender: p?.profile?.gender ?? '',
  dateOfBirth: p?.profile?.dateOfBirth ?? '',
  street: p?.address?.street ?? '',
  city: p?.address?.city ?? '',
  state: p?.address?.state ?? '',
  zipCode: p?.address?.zipCode ?? '',
})

const toPatchShape = (form) => ({
  firstName: form.firstName,
  lastName: form.lastName,
  phoneNumber: localToE164(form.phoneLocal),
  gender: form.gender,
  dateOfBirth: form.dateOfBirth,
  address: {
    street: form.street,
    city: form.city,
    state: form.state,
    zipCode: form.zipCode,
  },
})

export const useMyAccountViewModel = () => {
  const navigate = useNavigate()
  const { setAuthUser, clearAuthUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState(emptyForm)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    let active = true

    const run = async () => {
      setError('')
      setSuccessMessage('')
      try {
        const { data } = await fetchProfileMe({ signal: ac.signal })
        if (!active || !data) return
        setForm(applyProfile(data))
        setUsername(data.username || '')
        setAuthUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        })
      } catch (e) {
        if (e.name === 'AbortError' || ac.signal.aborted) return
        if (active) setError(e?.message || 'Failed to load profile')
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => {
      active = false
      ac.abort()
    }
  }, [setAuthUser])

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const displayName =
    `${form.firstName} ${form.lastName}`.trim() ||
    username ||
    'User'

  const save = async () => {
    setError('')
    setSuccessMessage('')
    setSaving(true)
    try {
      const { data } = await updateProfile(toPatchShape(form), {})
      if (data) {
        setForm(applyProfile(data))
        setUsername(data.username || '')
        setAuthUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        })
      }
      setSuccessMessage('Profile updated')
    } catch (e) {
      setError(e?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const performDeleteAccount = async () => {
    setError('')
    setSuccessMessage('')
    setDeleting(true)
    try {
      await deleteAccount()
      try {
        await logoutUser()
      } catch {
        // ignore; cookie may already be cleared
      }
      clearAuthUser()
      navigate('/hostels', { replace: true, state: { fromDelete: true } })
    } catch (e) {
      setError(e?.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return {
    form,
    username,
    activeTab,
    setActiveTab,
    loading,
    saving,
    deleting,
    error,
    successMessage,
    displayName,
    setField,
    save,
    performDeleteAccount,
  }
}
