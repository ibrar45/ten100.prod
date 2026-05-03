const normalizeBedStatus = (raw) => {
  const s = typeof raw?.status === 'string' ? raw.status.toLowerCase() : ''
  if (s === 'occupied' || s === 'available' || s === 'blocked') return s
  if (raw?.isAvailable === false) return 'occupied'
  if (raw?.isAvailable === true) return 'available'
  return 'available'
}

export const mapHostelBedFromApi = (raw) => ({
  bedId: raw?.bedId ?? raw?._id ?? '',
  hostelId: raw?.hostelId ?? '',
  hostelName: raw?.hostelName ?? '',
  roomId: raw?.roomId ?? '',
  roomNo: raw?.roomNo ?? '',
  bedNo: typeof raw?.bedNo === 'number' ? raw.bedNo : Number(raw?.bedNo) || 0,
  sharingType: raw?.sharingType != null ? String(raw.sharingType) : '',
  isAvailable: Boolean(raw?.isAvailable),
  status: normalizeBedStatus(raw),
  isListed: Boolean(raw?.isListed ?? raw?.listed ?? true),
  seatPrice: typeof raw?.seatPrice === 'number' ? raw.seatPrice : Number(raw?.seatPrice) || 0,
})
