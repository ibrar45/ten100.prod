import { Navigate, useParams } from 'react-router-dom'

export default function OwnerHostelEditRedirectView() {
  const { hostelId } = useParams()
  if (!hostelId) {
    return <Navigate to="/owner/listings" replace />
  }
  return <Navigate to={`/hostel/${hostelId}`} replace />
}
