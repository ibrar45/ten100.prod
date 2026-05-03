import { useMemo, useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import EmptyState from './EmptyState'
import RequestCard from './RequestCard'
import RequestResponseModal from './RequestResponseModal'
import SkeletonCard from './SkeletonCard'

export default function RequestsPanel({
  requests,
  loading,
  error,
  toastMessage,
  respondingRequestId,
  onRetry,
  onRespond,
  onClearToast,
}) {
  const [modal, setModal] = useState({ open: false, requestId: '', status: 'accepted', note: '' })
  const [modalError, setModalError] = useState('')

  const isSubmitting = respondingRequestId === modal.requestId
  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [requests],
  )

  const openModal = (requestId, status) => {
    setModal({ open: true, requestId, status, note: '' })
    setModalError('')
  }

  const closeModal = () => {
    if (isSubmitting) return
    setModal({ open: false, requestId: '', status: 'accepted', note: '' })
    setModalError('')
  }

  const confirmModal = async () => {
    try {
      setModalError('')
      await onRespond({
        requestId: modal.requestId,
        status: modal.status,
        note: modal.note.trim(),
      })
      closeModal()
    } catch (submitError) {
      setModalError(submitError?.message || 'Failed to update request')
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-lg backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Requests Inbox</h2>
          <p className="mt-1 text-sm text-slate-500">Manage incoming room visit requests from tenants.</p>
        </div>
      </div>

      {toastMessage ? (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <p>{toastMessage}</p>
          <button type="button" onClick={onClearToast} className="text-xs font-semibold">
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{error || 'Failed to load requests'}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
        {loading ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`req-sk-${index}`} />) : null}

        {!loading && sortedRequests.length === 0 ? (
          <EmptyState
            title="No Requests Yet"
            subtitle="You will see tenant requests here"
            icon={<MessageSquareText size={22} />}
          />
        ) : null}

        {!loading &&
          sortedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              busy={respondingRequestId === request.id}
              onAccept={() => openModal(request.id, 'accepted')}
              onReject={() => openModal(request.id, 'rejected')}
            />
          ))}
      </div>

      <RequestResponseModal
        open={modal.open}
        mode={modal.status}
        note={modal.note}
        onNoteChange={(note) => setModal((prev) => ({ ...prev, note }))}
        loading={isSubmitting}
        error={modalError}
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </section>
  )
}
