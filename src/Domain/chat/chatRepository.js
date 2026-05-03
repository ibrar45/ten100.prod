export const createChatRepositoryContract = (repository) => {
  if (!repository?.fetchHistory) {
    throw new Error('Chat repository must implement fetchHistory')
  }
  return repository
}
