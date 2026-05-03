import { fetchHostelBeds, fetchHostelDetails, fetchHostelRooms, fetchHostels } from '../../application/hostels/hostelsService'

export const hostelApi = {
  listHostels: (options = {}) => fetchHostels(options),
  listRooms: (options = {}) => fetchHostelRooms(options),
  listBeds: (options = {}) => fetchHostelBeds(options),
  getHostelDetails: (hostelId, options = {}) => fetchHostelDetails(hostelId, options),
}
