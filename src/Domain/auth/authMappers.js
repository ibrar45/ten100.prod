export const mapUserResponse = (user) => ({
  id: user?.id ?? user?._id ?? '',
  username: user?.username ?? '',
  email: user?.email ?? '',
  role: user?.role ?? 'user',
})
