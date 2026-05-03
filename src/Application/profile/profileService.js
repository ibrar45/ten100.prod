import { createProfileRepositoryContract } from '../../Domain/profile/profileRepository'
import { buildProfilePatchBody } from '../../Domain/profile/profileMappers'
import { createProfileApiRepository } from '../../Infrastructure/profile/profileApiRepository'

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
