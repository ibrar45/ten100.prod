import { resolveApiAssetUrl } from '../../shared/apiConfig'

const mapProfile = (profile) => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
})

const mapOwner = (owner) => ({
  id: owner?._id ?? '',
  username: owner?.username ?? '',
  email: owner?.email ?? '',
  role: owner?.role ?? '',
  profile: mapProfile(owner?.profile),
})

const mapContact = (contact) => ({
  phone: contact?.phone ?? '',
  alternatePhone: contact?.alternatePhone ?? '',
  email: contact?.email ?? '',
})

const mapAddress = (address) => ({
  city: address?.city ?? '',
  area: address?.area ?? '',
  street: address?.street ?? '',
  fullAddress: address?.fullAddress ?? '',
  pincode: address?.pincode ?? '',
})

const toAbsoluteImageUrl = (path) => {
  return resolveApiAssetUrl(path)
}

export const mapHostelFromApi = (raw) => ({
  id: raw?._id ?? '',
  owner: mapOwner(raw?.owner),
  name: raw?.name ?? '',
  code: raw?.code ?? '',
  genderPolicy: raw?.genderPolicy ?? '',
  isShortStayAvailable: Boolean(raw?.isShortStayAvailable),
  totalFloors: raw?.totalFloors ?? 0,
  contact: mapContact(raw?.contact),
  address: mapAddress(raw?.address),
  amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
  rules: Array.isArray(raw?.rules) ? raw.rules : [],
  images: Array.isArray(raw?.images) ? raw.images.map(toAbsoluteImageUrl) : [],
  isActive: Boolean(raw?.isActive),
  listingStatus: raw?.listingStatus ?? '',
  featured: Boolean(raw?.featured),
  ratingAverage: typeof raw?.ratingAverage === 'number' ? raw.ratingAverage : 0,
  createdAt: raw?.createdAt ?? '',
  updatedAt: raw?.updatedAt ?? '',
  totalRoomCount: raw?.totalRoomCount ?? 0,
  availableRoomCount: raw?.availableRoomCount ?? 0,
  totalAvailableSeats: raw?.totalAvailableSeats ?? 0,
})
