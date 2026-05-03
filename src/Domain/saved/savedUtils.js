export const isItemSaved = (savedItems, itemId) => {
  if (!itemId) return false
  return savedItems instanceof Set ? savedItems.has(String(itemId)) : false
}

export const toggleSaveState = (savedItems, itemId) => {
  const next = new Set(savedItems instanceof Set ? savedItems : [])
  const key = String(itemId)
  const wasSaved = next.has(key)
  if (wasSaved) next.delete(key)
  else next.add(key)
  return {
    nextSavedItems: next,
    isSaved: !wasSaved,
  }
}