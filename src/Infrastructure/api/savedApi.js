import { fetchSavedItems, removeSavedItem, saveItem } from '../../application/saved/savedService'

export const savedApi = {
  save: (itemType, itemId, options = {}) => saveItem(itemType, itemId, options),
  remove: (itemType, itemId, options = {}) => removeSavedItem(itemType, itemId, options),
  list: (options = {}) => fetchSavedItems(options),
}
