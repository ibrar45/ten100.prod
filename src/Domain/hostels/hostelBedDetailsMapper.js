import { resolveApiAssetUrl } from '../../shared/apiConfig'

const toAbsoluteImageUrl = (path) => resolveApiAssetUrl(path)

const asImageList = (value) => {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.map((x) => (x == null ? '' : String(x).trim())).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

const pickImagePaths = (raw) => {
  const buckets = [
    asImageList(raw?.room?.images),
    asImageList(raw?.room?.gallery),
    asImageList(raw?.room?.photos),
    asImageList(raw?.room?.media),
    asImageList(raw?.room?.picture),
    asImageList(raw?.room?.coverImage),
    asImageList(raw?.images),
    asImageList(raw?.roomImages),
    asImageList(raw?.gallery),
    asImageList(raw?.photos),
    asImageList(raw?.media),
    asImageList(raw?.picture),
    asImageList(raw?.coverImage),
    asImageList(raw?.thumbnail),
    asImageList(raw?.hostelImages),
    asImageList(raw?.hostel?.images),
    asImageList(raw?.listing?.images),
  ]

  const seen = new Set()
  const out = []
  for (const bucket of buckets) {
    for (const p of bucket) {
      if (!p || seen.has(p)) continue
      seen.add(p)
      out.push(p)
    }
  }
  return out
}

const mapOwnerProfile = (profile) => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  phoneNumber: profile?.phoneNumber ?? '',
})

const mapOwner = (owner) => ({
  id: owner?._id ?? owner?.id ?? owner?.userId ?? owner?.user_id ?? '',
  username: owner?.username ?? '',
  email: owner?.email ?? '',
  profile: mapOwnerProfile(owner?.profile),
})

const mapAddress = (address) => ({
  city: address?.city ?? '',
  area: address?.area ?? '',
  street: address?.street ?? '',
})

const mapRoomFeatures = (features) => ({
  attachedBath: Boolean(features?.attachedBath),
  acAvailable: Boolean(features?.acAvailable),
  geyserAvailable: Boolean(features?.geyserAvailable),
  hasWifi: Boolean(features?.hasWifi),
  hasBalcony: Boolean(features?.hasBalcony),
})

const mapContact = (contact) => ({
  phone: contact?.phone ?? '',
  email: contact?.email ?? '',
})

const firstNonEmptyPhone = (...values) => {
  for (const v of values) {
    const s = v == null ? '' : String(v).trim()
    if (s) return s
  }
  return ''
}

/** Bed payload may include a sparse `owner` while full phone lives on `hostel.owner`. */
const mergeOwnerRaw = (raw) => {
  const primary = raw?.owner
  const secondary = raw?.hostel?.owner ?? raw?.hostelOwner
  if (!primary) return secondary
  if (!secondary) return primary
  const phone = firstNonEmptyPhone(
    primary?.profile?.phoneNumber,
    secondary?.profile?.phoneNumber,
  )
  return {
    ...secondary,
    ...primary,
    profile: {
      ...(secondary.profile ?? {}),
      ...(primary.profile ?? {}),
      phoneNumber:
        phone || primary?.profile?.phoneNumber || secondary?.profile?.phoneNumber || '',
    },
  }
}

export const mapHostelBedDetailsFromApi = (raw) => ({
  hostelId: raw?.hostelId ?? raw?.hostel?._id ?? raw?.hostel?.id ?? raw?.listingId ?? '',
  hostelName: raw?.hostelName ?? '',
  hostelAddress: mapAddress(raw?.hostelAddress),
  images: pickImagePaths(raw).map(toAbsoluteImageUrl),
  owner: mapOwner(mergeOwnerRaw(raw)),
  roomId: raw?.roomId ?? '',
  roomNo: raw?.roomNo ?? '',
  floorNumber: typeof raw?.floorNumber === 'number' ? raw.floorNumber : 0,
  bedNo: typeof raw?.bedNo === 'number' ? raw.bedNo : Number(raw?.bedNo) || 0,
  isAvailable: Boolean(raw?.isAvailable),
  sharingType:
    typeof raw?.sharingType === 'number' ? raw.sharingType : Number(raw?.sharingType) || 0,
  sharingTypeLabel: raw?.sharingTypeLabel ?? '',
  seatPrice: typeof raw?.seatPrice === 'number' ? raw.seatPrice : Number(raw?.seatPrice) || 0,
  roomFeatures: mapRoomFeatures(raw?.roomFeatures),
  contact: mapContact({
    ...(raw?.contact ?? {}),
    phone: firstNonEmptyPhone(
      raw?.contact?.phone,
      raw?.hostelContact?.phone,
      raw?.hostel?.contact?.phone,
      raw?.ownerPhone,
      raw?.listing?.contact?.phone,
    ),
  }),
})
