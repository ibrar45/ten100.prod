import { createSavedRepositoryContract } from '../../Domain/saved/savedRepository'
import { createSavedApiRepository } from '../../Infrastructure/saved/savedApiRepository'

const savedRepository = createSavedRepositoryContract(createSavedApiRepository())

export const saveItem = (itemType, itemId, options = {}) =>
  savedRepository.saveItem(itemType, itemId, options)

export const removeSavedItem = (itemType, itemId, options = {}) =>
  savedRepository.removeSavedItem(itemType, itemId, options)

export const fetchSavedItems = (options = {}) => savedRepository.fetchSavedItems(options)