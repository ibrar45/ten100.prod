import {
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import AppHeader from '../../shared/components/AppHeader'
import AccountProfilePanel from '../components/AccountProfilePanel'
import AccountSecurityPanel from '../components/AccountSecurityPanel'
import { useMyAccountViewModel } from '../hooks/useMyAccountViewModel'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

export default function MyAccountView() {
  const {
    form,
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
  } = useMyAccountViewModel()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <AppHeader />

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-5">
            <div className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-white">
              <Settings className="h-5 w-5 text-slate-300" aria-hidden />
              <span>Account Settings</span>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
          <main className="min-w-0 bg-white p-4 sm:p-6 lg:p-8">
          {activeTab === 'profile' ? (
            <AccountProfilePanel
              form={form}
              loading={loading}
              saving={saving}
              deleting={deleting}
              error={error}
              successMessage={successMessage}
              displayName={displayName}
              setField={setField}
              onSave={save}
              onDeleteAccount={performDeleteAccount}
            />
          ) : activeTab === 'security' ? (
            <AccountSecurityPanel />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-stone-100/90 p-8 text-slate-600 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
              <p className="mt-2 text-sm">
                This section is coming soon. Use Profile to edit your account
                details.
              </p>
            </div>
          )}
          </main>
        </section>
      </div>
    </div>
  )
}
