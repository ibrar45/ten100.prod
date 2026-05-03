import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLoginViewModel } from '../hooks/useLoginViewModel'
import { useAuth } from '../../shared/context/useAuth'

export default function LoginView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuthUser } = useAuth()
  const isLogin = location.pathname !== '/register'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    form,
    roles,
    rolesLoading,
    loading,
    error,
    successMessage,
    setIdentifier,
    setUsername,
    setEmail,
    setPassword,
    setRole,
    setConfirmPassword,
    submit,
  } = useLoginViewModel();

  const onSubmit = async (e) => {
    e.preventDefault()
    const response = await submit(isLogin)
    if (isLogin) {
      setAuthUser(response?.user || null)
      const redirectTo =
        location.state?.from ||
        (response?.user?.role === 'owner' ? '/owner/dashboard' : '/hostels')
      navigate(redirectTo, { replace: true })
    }
  }

  return (
    <main className="relative min-h-screen px-4 py-10 text-slate-100 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/src/assets/backgroud.png')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/80" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section
          className={`flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-all duration-700 lg:h-[600px] lg:flex-row ${!isLogin ? "lg:flex-row-reverse" : ""}`}
        >
          <aside className="hidden w-1/2 bg-gradient-to-br from-indigo-600/90 via-violet-600/80 to-cyan-500/80 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                TEN100.com
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white">
                {isLogin ? "Welcome back" : "Start your journey"}
              </h1>
              <p className="text-sm text-white/85">
                {isLogin
                  ? "Sign in to access your account and manage your workspace securely."
                  : "Join our platform to streamline your workflow and boost productivity."}
              </p>
            </div>
            <div className="soft-float rounded-2xl border border-white/25 bg-white/15 p-4 text-xs text-white/90">
              <div className="inline-flex items-center gap-1">
                <ShieldCheck size={14} />
                {isLogin ? "Standard secure login." : "Enterprise account registration."}
              </div>
            </div>
          </aside>

          <div className="flex w-full flex-col justify-center p-6 sm:p-10 lg:w-1/2 lg:p-12">
            <div className="w-full">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {isLogin ? "Login" : "Register"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {isLogin ? "Access your account" : "Create a new account"}
              </p>

              <form onSubmit={onSubmit} className="mt-6">
                <div className={`grid gap-4 ${isLogin ? "grid-cols-1" : "grid-cols-2"}`}>
                  {isLogin ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Identifier</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500/50"
                          value={form.identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="User ID"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Username</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/50"
                          value={form.username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Username"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
                        <input
                          type="email"
                          className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/50"
                          value={form.email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Role</label>
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/50"
                          value={form.role}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={rolesLoading}
                        >
                          {roles.length === 0 && <option value="">{rolesLoading ? "Loading…" : "Select Role"}</option>}
                          {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className={!isLogin ? "col-span-2 sm:col-span-1" : "col-span-1"}>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 pr-10 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50"
                        value={form.password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">Confirm</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 pr-10 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50"
                          value={form.confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-200">
                    {error.message}
                  </p>
                )}
                {successMessage && (
                  <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
                    {successMessage}
                  </p>
                )}

                <div className="mt-8 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "…" : isLogin ? "Sign In" : "Create Account"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(isLogin ? '/register' : '/login')}
                    className="w-full py-2 text-xs font-medium text-slate-400 transition hover:text-white"
                  >
                    {isLogin ? "New here? Create an account" : "Have an account? Log in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
