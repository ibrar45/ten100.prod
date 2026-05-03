/**
 * Profile repository contract (simple DDD).
 */
export const createProfileRepositoryContract = (repository) => {
  if (!repository?.getMe || !repository?.updateMe) {
    throw new Error('Profile repository must implement getMe and updateMe')
  }
  return repository
}
