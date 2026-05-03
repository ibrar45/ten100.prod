import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../../application/auth/authService'
import { fetchProfileMe, updateProfilePartial } from '../../features/profile'
import { useAuth } from '../../shared/context/useAuth'

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '')

export default function CreatePropertyGateView() {
  const navigate = useNavigate()
  const { isAuthenticated, setAuthUser } = useAuth()
  const mode = isAuthenticated ? 'logged_in' : 'guest'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stepChanging, setStepChanging] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneCountryCode: '+92',
    phoneLocal: '',
    dateOfBirth: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [stepIndex, setStepIndex] = useState(0)
  const transitionTimeoutRef = useRef(null)

  const steps = useMemo(() => {
    if (mode === 'guest') {
      return ['email', 'credentials', 'personal', 'address']
    }
    return ['personal', 'address']
  }, [mode])

  const currentStep = steps[stepIndex]

  const title = useMemo(() => {
    if (currentStep === 'email') return 'Sign in or create an account'
    if (currentStep === 'credentials') return 'Set your account credentials'
    if (currentStep === 'personal') return 'Add your personal details'
    if (currentStep === 'address') return 'Add your address details'
    return 'Complete your profile'
  }, [currentStep])

  const syncFromProfile = (data) => {
    setValues({
      email: data?.email || '',
      username: data?.username || '',
      password: '',
      confirmPassword: '',
      firstName: data?.profile?.firstName || '',
      lastName: data?.profile?.lastName || '',
      phoneCountryCode: '+92',
      phoneLocal: (data?.profile?.phoneNumber || '').replace(/^\+92/, ''),
      dateOfBirth: toDateInput(data?.profile?.dateOfBirth),
      street: data?.address?.street || '',
      city: data?.address?.city || '',
      state: data?.address?.state || '',
      zipCode: data?.address?.zipCode || '',
    })
  }

  const refreshProfile = async () => {
    const response = await fetchProfileMe()
    const data = response?.data || null
    syncFromProfile(data)
    setAuthUser({
      id: data?.id || '',
      username: data?.username || '',
      email: data?.email || '',
      role: data?.role || 'user',
    })
  }

  const moveToStep = (nextIndex) => {
    setStepChanging(true)
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = setTimeout(() => {
      setStepIndex(nextIndex)
      setStepChanging(false)
    }, 140)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      if (mode === 'logged_in') {
        try {
          await refreshProfile()
        } catch (e) {
          setError(e?.message || 'Failed to load profile')
        }
      }
      setLoading(false)
    }

    load()

    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const setField = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }))

  const submitCurrentStep = async (event) => {
    event.preventDefault()
    setError('')

    if (currentStep === 'email') {
      if (!values.email.trim()) {
        setError('Email is required.')
        return
      }
      moveToStep(stepIndex + 1)
      return
    }

    if (currentStep === 'credentials') {
      if (!values.username.trim() || !values.password.trim()) {
        setError('Username and password are required.')
        return
      }
      if (values.password !== values.confirmPassword) {
        setError('Password and confirm password do not match.')
        return
      }
      moveToStep(stepIndex + 1)
      return
    }

    if (currentStep === 'personal') {
      if (
        !values.firstName.trim() ||
        !values.lastName.trim() ||
        !values.phoneLocal.trim() ||
        !values.dateOfBirth.trim()
      ) {
        setError('First name, last name, phone number and date of birth are required.')
        return
      }
      moveToStep(stepIndex + 1)
      return
    }

    if (currentStep !== 'address') {
      return
    }

    if (
      !values.street.trim() ||
      !values.city.trim() ||
      !values.state.trim() ||
      !String(values.zipCode).trim()
    ) {
      setError('Street, city, state and zip code are required.')
      return
    }

    const profilePatch = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: `${values.phoneCountryCode}${values.phoneLocal.trim()}`,
      gender: 'male',
      dateOfBirth: values.dateOfBirth.trim(),
      address: {
        street: values.street.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        zipCode: String(values.zipCode).trim(),
      },
    }

    setSaving(true)
    try {
      if (mode === 'guest') {
        await registerUser({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
        })
        const loginResponse = await loginUser({
          identifier: values.email.trim(),
          password: values.password,
        })
        if (loginResponse?.user) {
          setAuthUser(loginResponse.user)
        }
      }

      const profileResponse = await updateProfilePartial(profilePatch)
      const profileData = profileResponse?.data
      if (profileData) {
        setAuthUser({
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          role: profileData.role,
        })
      }

      await refreshProfile()
      navigate('/hostels/create/form', { replace: true })
    } catch (e) {
      setError(e?.message || 'Failed to continue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Checking profile completeness...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Sign in or create an account
        </h1>
        <p className="mt-4 text-2xl font-semibold text-slate-800">{title}</p>
        <p className="mt-2 text-sm text-slate-600">
          Complete your profile before creating a hostel listing.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div
          className={`mt-6 transition-all duration-150 ${
            stepChanging ? 'translate-x-2 opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          <form onSubmit={submitCurrentStep} className="space-y-4">
            {currentStep === 'email' && (
              <input
                type="email"
                value={values.email}
                onChange={setField('email')}
                placeholder="Enter your email address"
                className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
              />
            )}

            {currentStep === 'credentials' && (
              <>
                <input
                  value={values.username}
                  onChange={setField('username')}
                  placeholder="Enter username"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  value={values.password}
                  onChange={setField('password')}
                  placeholder="Enter password"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  value={values.confirmPassword}
                  onChange={setField('confirmPassword')}
                  placeholder="Confirm password"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
              </>
            )}

            {currentStep === 'personal' && (
              <>
                <input
                  value={values.firstName}
                  onChange={setField('firstName')}
                  placeholder="Enter first name"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  value={values.lastName}
                  onChange={setField('lastName')}
                  placeholder="Enter last name"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    value={values.phoneCountryCode}
                    onChange={setField('phoneCountryCode')}
                    className="h-12 w-24 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                  />
                  <input
                    value={values.phoneLocal}
                    onChange={setField('phoneLocal')}
                    placeholder="Phone number"
                    className="h-12 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="date"
                  value={values.dateOfBirth}
                  onChange={setField('dateOfBirth')}
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
              </>
            )}

            {currentStep === 'address' && (
              <>
                <input
                  value={values.street}
                  onChange={setField('street')}
                  placeholder="Street"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  value={values.city}
                  onChange={setField('city')}
                  placeholder="City"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  value={values.state}
                  onChange={setField('state')}
                  placeholder="State"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
                <input
                  value={values.zipCode}
                  onChange={setField('zipCode')}
                  placeholder="Zip code"
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500"
                />
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 h-12 w-full rounded-md bg-blue-600 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

