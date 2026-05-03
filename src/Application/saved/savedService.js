import { createSavedRepositoryContract } from '../../domain/saved/savedRepository'
import { createSavedApiRepository } from '../../infrastructure/saved/savedApiRepository'

const savedRepository = createSavedRepositoryContract(createSavedApiRepository())

export const saveItem = (itemType, itemId, options = {}) =>
  savedRepository.saveItem(itemType, itemId, options)

export const removeSavedItem = (itemType, itemId, options = {}) =>
  savedRepository.removeSavedItem(itemType, itemId, options)

export const fetchSavedItems = (options = {}) => savedRepository.fetchSavedItems(options)