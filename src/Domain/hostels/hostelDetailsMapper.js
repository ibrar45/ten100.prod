import { resolveApiAssetUrl } from '../../shared/apiConfig'

const mapContact = (contact) => ({
  phone: contact?.phone ?? '',
  email: contact?.email ?? '',
})

const mapAddress = (address) => ({
  city: address?.city ?? '',
  area: address?.area ?? '',
  street: address?.street ?? '',
})

const mapOwner = (owner) => ({
  id: owner?._id ?? '',
  username: owner?.username ?? '',
  email: owner?.email ?? '',
  role: owner?.role ?? '',
  profile: {
    firstName: owner?.profile?.firstName ?? '',
    lastName: owner?.profile?.lastName ?? '',
    phoneNumber: owner?.profile?.phoneNumber ?? '',
  },
})

const normalizeInlineBedStatus = (b) => {
  const s = typeof b?.status === 'string' ? b.status.toLowerCase() : ''
  if (s === 'occupied' || s === 'available' || s === 'blocked') return s
  if (b?.isAvailable === false) return 'occupied'
  if (b?.isAvailable === true) return 'available'
  return 'available'
}

const mapBedInRoom = (b) => ({
  id: b?._id ?? b?.bedId ?? '',
  bedNo: typeof b?.bedNo === 'number' ? b.bedNo : Number(b?.bedNo) || 0,
  status: normalizeInlineBedStatus(b),
  listed: Boolean(b?.isListed ?? b?.listed ?? true),
})

const mapRoom = (room) => ({
  id: room?._id ?? '',
  roomNo: room?.roomNo ?? '',
  floorNumber: typeof room?.floorNumber === 'number' ? room.floorNumber : 0,
  totalSeats: typeof room?.totalSeats === 'number' ? room.totalSeats : 0,
  availableSeats: typeof room?.availableSeats === 'number' ? room.availableSeats : 0,
  attachedBath: Boolean(room?.attachedBath),
  acAvailable: Boolean(room?.acAvailable),
  geyserAvailable: Boolean(room?.geyserAvailable),
  sharingType: typeof room?.sharingType === 'number' ? room.sharingType : Number(room?.sharingType) || 0,
  rentPerBed: typeof room?.rentPerBed === 'number' ? room.rentPerBed : 0,
  rentPerBedPerDay:
    typeof room?.rentPerBedPerDay === 'number'
      ? room.rentPerBedPerDay
      : Number(room?.rentPerBedPerDay) || 0,
  securityDeposit:
    typeof room?.securityDeposit === 'number' ? room.securityDeposit : 0,
  roomType: room?.roomType ?? '',
  furnishing: room?.furnishing ?? '',
  hasBalcony: Boolean(room?.hasBalcony),
  hasWifi: Boolean(room?.hasWifi),
  status: room?.status ?? '',
  images: Array.isArray(room?.images) ? room.images.map(toAbsoluteImageUrl) : [],
  beds: Array.isArray(room?.beds) ? room.beds.map(mapBedInRoom) : [],
})

const toAbsoluteImageUrl = (path) => {
  return resolveApiAssetUrl(path)
}

export const mapHostelDetailsFromApi = (raw) => ({
  id: raw?._id ?? '',
  name: raw?.name ?? '',
  code: raw?.code ?? '',
  owner: mapOwner(raw?.owner),
  contact: mapContact(raw?.contact),
  address: mapAddress(raw?.address),
  genderPolicy: raw?.genderPolicy ?? '',
  isShortStayAvailable: Boolean(raw?.isShortStayAvailable),
  totalFloors: typeof raw?.totalFloors === 'number' ? raw.totalFloors : 0,
  amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
  rules: Array.isArray(raw?.rules) ? raw.rules : [],
  images: Array.isArray(raw?.images) ? raw.images.map(toAbsoluteImageUrl) : [],
  isActive: Boolean(raw?.isActive),
  listingStatus: raw?.listingStatus ?? '',
  totalRoomCount: typeof raw?.totalRoomCount === 'number' ? raw.totalRoomCount : 0,
  totalAvailableSeats:
    typeof raw?.totalAvailableSeats === 'number' ? raw.totalAvailableSeats : 0,
  featured: Boolean(raw?.featured),
  ratingAverage: typeof raw?.ratingAverage === 'number' ? raw.ratingAverage : 0,
  rooms: Array.isArray(raw?.rooms) ? raw.rooms.map(mapRoom) : [],
  createdAt: raw?.createdAt ?? '',
  updatedAt: raw?.updatedAt ?? '',
})
