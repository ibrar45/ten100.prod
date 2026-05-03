import { createHostelsRepositoryContract } from '../../Domain/hostels/hostelsRepository'
import { createHostelsApiRepository } from '../../Infrastructure/hostels/hostelsApiRepository'

const hostelsRepository = createHostelsRepositoryContract(createHostelsApiRepository())

export const fetchHostels = async (options = {}) => hostelsRepository.list(options)

export const fetchMyHostels = async (options = {}) => hostelsRepository.listMine(options)

export const fetchHostelDetails = async (hostelId, options = {}) =>
  hostelsRepository.getById(hostelId, options)

export const fetchHostelRooms = async (options = {}) =>
  hostelsRepository.listRooms(options)

export const fetchHostelBeds = async (options = {}) =>
  hostelsRepository.listBeds(options)

export const fetchHostelBedDetails = async (
  hostelId,
  roomId,
  bedNo,
  options = {},
) => hostelsRepository.getBedDetails(hostelId, roomId, bedNo, options)

export const patchHostelBed = async (bedId, payload = {}, options = {}) =>
  hostelsRepository.patchBed(bedId, payload, options)

export const createHostel = async (formData, options = {}) =>
  hostelsRepository.create(formData, options)

export const updateHostel = async (hostelId, payload, options = {}) =>
  hostelsRepository.update(hostelId, payload, options)

export const deleteHostel = async (hostelId, options = {}) =>
  hostelsRepository.remove(hostelId, options)

export const createRoom = async (hostelId, payload, options = {}) =>
  hostelsRepository.createRoom(hostelId, payload, options)

export const publishHostel = async (hostelId, options = {}) =>
  hostelsRepository.publish(hostelId, options)

export const requestHostelRoom = async (
  hostelId,
  roomId,
  payload = {},
  options = {},
) => hostelsRepository.requestRoom(hostelId, roomId, payload, options)

export const fetchOwnerRequestsInbox = async (options = {}) =>
  hostelsRepository.listRoomRequestsInbox(options)

export const respondToOwnerRequest = async (payload = {}, options = {}) =>
  hostelsRepository.respondRoomRequest(payload, options)

export const trackHostelCallClick = async (hostelId, options = {}) =>
  hostelsRepository.trackCallClick(hostelId, options)

export const fetchOwnerDashboardAnalytics = async (options = {}) =>
  hostelsRepository.getOwnerDashboardAnalytics(options)
