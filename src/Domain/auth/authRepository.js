/**
 * Auth repository contract (simple DDD).
 * Infrastructure layer should implement these methods.
 */
export const createAuthRepositoryContract = (repository) => {
  if (
    !repository?.register ||
    !repository?.login ||
    !repository?.me ||
    !repository?.logout ||
    !repository?.changePassword ||
    !repository?.deleteAccount
  ) {
    throw new Error(
      'Auth repository must implement register, login, me, logout, changePassword, and deleteAccount',
    )
  }

  return repository
}
