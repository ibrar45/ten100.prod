const toDateInput = (value) => {
  if (value == null || value === '') return ''
  const s = String(value)
  if (s.length >= 10) return s.slice(0, 10)
  return s
}

export const mapProfileFromApi = (data) => ({
  id: data?._id ?? data?.id ?? '',
  username: data?.username ?? '',
  email: data?.email ?? '',
  role: data?.role ?? '',
  profile: {
    firstName: data?.profile?.firstName ?? '',
    lastName: data?.profile?.lastName ?? '',
    phoneNumber: data?.profile?.phoneNumber ?? '',
    gender: data?.profile?.gender ?? '',
    dateOfBirth: toDateInput(data?.profile?.dateOfBirth),
  },
  address: {
    street: data?.address?.street ?? '',
    city: data?.address?.city ?? '',
    state: data?.address?.state ?? '',
    zipCode: data?.address?.zipCode != null ? String(data.address.zipCode) : '',
  },
})

export const buildProfilePatchBody = ({
  firstName,
  lastName,
  phoneNumber,
  gender,
  dateOfBirth,
  address,
}) => ({
  firstName: firstName ?? '',
  lastName: lastName ?? '',
  phoneNumber: phoneNumber ?? '',
  gender: gender ?? '',
  dateOfBirth: dateOfBirth ?? '',
  address: {
    street: address?.street ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: address?.zipCode ?? '',
  },
})
