import { createProfileRepositoryContract } from '../../domain/profile/profileRepository'
import { buildProfilePatchBody } from '../../domain/profile/profileMappers'
import { createProfileApiRepository } from '../../infrastructure/profile/profileApiRepository'

const profileRepository = createProfileRepositoryContract(
  createProfileApiRepository(),
)

export const fetchProfileMe = (options) => profileRepository.getMe(options)

export const updateProfile = async (form, options) => {
  const body = buildProfilePatchBody(form)
  await profileRepository.updateMe(body, options)
  return profileRepository.getMe(options)
}

export const updateProfilePartial = async (patchBody, options) => {
  await profileRepository.updateMe(patchBody, options)
  return profileRepository.getMe(options)
}
