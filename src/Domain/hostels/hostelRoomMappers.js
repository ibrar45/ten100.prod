const mapProfile = (profile) => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
})

const mapRoomOwner = (owner) => ({
  id: owner?._id ?? '',
  username: owner?.username ?? '',
  email: owner?.email ?? '',
  profile: mapProfile(owner?.profile),
})

const mapHostelAddress = (address) => ({
  city: address?.city ?? '',
  area: address?.area ?? '',
  street: address?.street ?? '',
  fullAddress: address?.fullAddress ?? '',
  pincode: address?.pincode ?? '',
})

export const mapHostelRoomFromApi = (raw) => ({
  hostelId: raw?.hostelId ?? '',
  hostelName: raw?.hostelName ?? '',
  hostelAddress: mapHostelAddress(raw?.hostelAddress),
  owner: mapRoomOwner(raw?.owner),
  roomId: raw?.roomId ?? '',
  roomNo: raw?.roomNo ?? '',
  floorNumber: typeof raw?.floorNumber === 'number' ? raw.floorNumber : 0,
  totalSeats: typeof raw?.totalSeats === 'number' ? raw.totalSeats : 0,
  availableSeats: typeof raw?.availableSeats === 'number' ? raw.availableSeats : 0,
  status: raw?.status ?? '',
  attachedBath: Boolean(raw?.attachedBath),
  acAvailable: Boolean(raw?.acAvailable),
  geyserAvailable: Boolean(raw?.geyserAvailable),
  sharingType: typeof raw?.sharingType === 'number' ? raw.sharingType : 0,
  rentPerBed: typeof raw?.rentPerBed === 'number' ? raw.rentPerBed : 0,
  rentPerBedPerDay:
    typeof raw?.rentPerBedPerDay === 'number'
      ? raw.rentPerBedPerDay
      : Number(raw?.rentPerBedPerDay) || 0,
})
