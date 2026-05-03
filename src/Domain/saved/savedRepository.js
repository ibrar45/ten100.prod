export const createSavedRepositoryContract = (repository) => {
  if (!repository?.saveItem || !repository?.removeSavedItem || !repository?.fetchSavedItems) {
    throw new Error('Saved repository must implement saveItem, removeSavedItem, and fetchSavedItems')
  }
  return repository
}