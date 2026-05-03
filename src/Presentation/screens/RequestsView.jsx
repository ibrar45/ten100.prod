import { MessageSquareText } from 'lucide-react'
import AppHeader from '../../shared/components/AppHeader'
import EmptyStateCard from '../components/EmptyStateCard'

export default function RequestsView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <AppHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-screen-lg items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl">
          <EmptyStateCard
            icon={<MessageSquareText size={22} />}
            title="My Messages"
            subtitle="No messages yet"
          />
        </div>
      </main>
    </div>
  )
}
