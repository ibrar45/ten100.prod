import { Check, Eye, EyeOff } from 'lucide-react'
import { useAccountSecurityViewModel } from '../hooks/useAccountSecurityViewModel'

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  disabled,
  autoComplete,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-11 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:text-slate-800"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
)

export default function AccountSecurityPanel() {
  const {
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
    loading,
    error,
    successMessage,
    submitChangePassword,
  } = useAccountSecurityViewModel()

  const busy = loading

  return (
    <div className="mx-auto max-w-2xl">
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-stone-100/90 shadow-sm">
        <form onSubmit={submitChangePassword} className="space-y-5 p-5 sm:p-7">
          <h2 className="text-base font-semibold text-slate-800">
            Change password
          </h2>
          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((v) => !v)}
            disabled={busy}
            autoComplete="current-password"
          />
          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            onToggleVisible={() => setShowNew((v) => !v)}
            disabled={busy}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm-new-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
            disabled={busy}
            autoComplete="new-password"
          />

          <ul className="space-y-2 border-t border-slate-200/80 pt-4">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start gap-2 text-sm text-slate-500"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-end border-t border-slate-200/80 pt-5">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-emerald-900 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
