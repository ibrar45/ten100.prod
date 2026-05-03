const asText = (value) => (typeof value === 'string' ? value : '')

export const mapRoomRequestFromApi = (raw = {}) => {
  const tenantProfile = raw?.tenant?.profile ?? raw?.tenantProfile ?? {}
  const hostel = raw?.hostel ?? {}
  const address = hostel?.address ?? {}

  return {
    id: raw?._id ?? raw?.id ?? '',
    tenantId: String(raw?.tenant?._id ?? raw?.tenant?.id ?? raw?.tenantId ?? ''),
    hostelId: String(raw?.hostel?._id ?? raw?.hostel?.id ?? raw?.hostelId ?? ''),
    status: asText(raw?.status).toLowerCase() || 'pending',
    note: asText(raw?.note),
    tenantMessage: asText(raw?.tenantMessage ?? raw?.message),
    createdAt: asText(raw?.createdAt),
    tenant: {
      firstName: asText(tenantProfile?.firstName),
      lastName: asText(tenantProfile?.lastName),
    },
    hostel: {
      name: asText(hostel?.name),
      city: asText(address?.city),
      area: asText(address?.area),
    },
  }
}
