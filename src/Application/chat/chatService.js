import { createChatRepositoryContract } from '../../Domain/chat/chatRepository'
import { createChatApiRepository } from '../../Infrastructure/chat/chatApiRepository'

const chatRepository = createChatRepositoryContract(createChatApiRepository())

export const fetchChatHistory = async (hostelId, peerId, options = {}) =>
  chatRepository.fetchHistory(hostelId, peerId, options)

export const fetchChatConversationSummaries = async (hostelId, options = {}) =>
  chatRepository.fetchConversationSummaries(hostelId, options)
