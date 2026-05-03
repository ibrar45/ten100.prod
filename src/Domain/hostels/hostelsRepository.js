/**
 * Hostels repository contract (simple DDD).
 */
export const createHostelsRepositoryContract = (repository) => {
  if (
    !repository?.list ||
    !repository?.listMine ||
    !repository?.getById ||
    !repository?.listRooms ||
    !repository?.listBeds ||
    !repository?.getBedDetails ||
    !repository?.create ||
    !repository?.update ||
    !repository?.remove ||
    !repository?.createRoom ||
    !repository?.publish ||
    !repository?.requestRoom ||
    !repository?.listRoomRequestsInbox ||
    !repository?.respondRoomRequest ||
    !repository?.trackCallClick ||
    !repository?.getOwnerDashboardAnalytics ||
    !repository?.patchBed
  ) {
    throw new Error(
      'Hostels repository must implement list, listMine, getById, listRooms, listBeds, getBedDetails, patchBed, create, update, remove, createRoom, publish, requestRoom, listRoomRequestsInbox, respondRoomRequest, trackCallClick, and getOwnerDashboardAnalytics',
    )
  }

  return repository
}
